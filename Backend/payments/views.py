from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated

from django.db.models import Sum
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import IsProvider
from rest_framework import status

from .models import Payment
from drf_spectacular.utils import extend_schema
from .serializers import PaymentSerializer, PaymentVerifySerializer
from notifications.services import create_notification
from .gateway import initiate_gateway_payment, verify_gateway_payment


class PaymentListCreateView(generics.ListCreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        if user.role != "CUSTOMER":
            raise PermissionDenied(
                "Only customers can create payments."
            )

        booking = serializer.validated_data["booking"]

        if booking.customer != user:
            raise PermissionDenied(
                "You can only pay for your own bookings."
            )

        if booking.status not in ["ACCEPTED", "COMPLETED"]:
            raise ValidationError(
                "Only accepted or completed bookings can be paid."
            )

        if Payment.objects.filter(booking=booking).exists():
            raise ValidationError(
                "This booking already has a payment."
            )

        provider = booking.service.provider

        amount = booking.service.price

        payment = serializer.save(
            customer=user,
            provider=provider,
            amount=amount,
        )

class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Payment.objects.all()

        if user.role == "CUSTOMER":
            return Payment.objects.filter(customer=user)

        if user.role == "PROVIDER":
            return Payment.objects.filter(provider=user)

        return Payment.objects.none()

    def perform_update(self, serializer):
        user = self.request.user
        payment = serializer.instance

        if user.role == "ADMIN":
            serializer.save()
            return

        raise PermissionDenied(
            "Only admins can update payments."
        )

    def perform_destroy(self, instance):
        user = self.request.user

        if user.role != "ADMIN":
            raise PermissionDenied(
                "Only admins can delete payments."
            )

        instance.delete()

class ProviderEarningsView(APIView):
    permission_classes = [IsAuthenticated, IsProvider]

    def get(self, request):
        provider = request.user

        completed = Payment.objects.filter(
            provider=provider, status="COMPLETED"
        )

        total_earnings = completed.aggregate(total=Sum("amount"))["total"] or 0
        total_completed_payments = completed.count()

        now = timezone.now()
        this_month = completed.filter(
            created_at__year=now.year, created_at__month=now.month
        )
        this_month_earnings = this_month.aggregate(
            total=Sum("amount")
        )["total"] or 0

        pending = Payment.objects.filter(
            provider=provider, status="PENDING"
        ).aggregate(total=Sum("amount"))["total"] or 0

        return Response(
            {
                "total_earnings": total_earnings,
                "total_completed_payments": total_completed_payments,
                "this_month_earnings": this_month_earnings,
                "pending_amount": pending,
            }
        )

class PaymentInitiateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk)
        except Payment.DoesNotExist:
            return Response(
                {"detail": "Payment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if payment.customer != request.user:
            raise PermissionDenied(
                "You can only initiate your own payments."
            )

        if payment.status != Payment.Status.PENDING:
            raise ValidationError(
                "Only pending payments can be initiated."
            )

        if payment.payment_method != Payment.PaymentMethod.ONLINE:
            raise ValidationError(
                "Only online payments go through the gateway."
            )

        gateway_result = initiate_gateway_payment(payment)

        payment.transaction_id = gateway_result["transaction_id"]
        payment.save(update_fields=["transaction_id"])

        return Response(
            {
                "payment_id": payment.id,
                "transaction_id": gateway_result["transaction_id"],
                "payment_url": gateway_result["payment_url"],
            },
            status=status.HTTP_200_OK,
        )

@extend_schema(request=PaymentVerifySerializer)
class PaymentVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk)
        except Payment.DoesNotExist:
            return Response(
                {"detail": "Payment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if payment.customer != request.user and request.user.role != "ADMIN":
            raise PermissionDenied(
                "You can only verify your own payments."
            )

        if payment.status != Payment.Status.PENDING:
            raise ValidationError(
                "Only pending payments can be verified."
            )

        if not payment.transaction_id:
            raise ValidationError(
                "Payment has not been initiated with the gateway yet."
            )

        simulate_success = request.data.get("success", True)
        verified = verify_gateway_payment(
            payment.transaction_id, simulate_success=simulate_success
        )

        if verified:
            payment.status = Payment.Status.COMPLETED
            payment.save(update_fields=["status"])

            create_notification(
                recipient=payment.provider,
                notification_type="PAYMENT",
                title="Payment received",
                message=(
                    f"You received a payment of {payment.amount} "
                    f"for {payment.booking.service.title}."
                ),
            )

            create_notification(
                recipient=payment.customer,
                notification_type="PAYMENT",
                title="Payment successful",
                message=(
                    f"Your payment of {payment.amount} for "
                    f"{payment.booking.service.title} was successful."
                ),
            )
        else:
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status"])

            create_notification(
                recipient=payment.customer,
                notification_type="PAYMENT",
                title="Payment failed",
                message=(
                    f"Your payment of {payment.amount} for "
                    f"{payment.booking.service.title} failed. Please try again."
                ),
            )

        return Response(
            PaymentSerializer(payment).data,
            status=status.HTTP_200_OK,
        )