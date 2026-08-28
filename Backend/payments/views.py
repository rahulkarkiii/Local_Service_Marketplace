from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated

from .models import Payment
from .serializers import PaymentSerializer


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

        serializer.save(
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