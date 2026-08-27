from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Booking
from .serializers import BookingSerializer


class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "CUSTOMER":
            return Booking.objects.filter(
                customer=user
            ).select_related("service", "service__provider")

        if user.role == "PROVIDER":
            return Booking.objects.filter(
                service__provider=user
            ).select_related("customer", "service")

        if user.role == "ADMIN":
            return Booking.objects.all().select_related(
                "customer",
                "service",
                "service__provider",
            )

        return Booking.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != "CUSTOMER":
            raise PermissionDenied(
                "Only customers can create bookings."
            )

        serializer.save(customer=self.request.user)


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "CUSTOMER":
            return Booking.objects.filter(customer=user)

        if user.role == "PROVIDER":
            return Booking.objects.filter(service__provider=user)

        if user.role == "ADMIN":
            return Booking.objects.all()

        return Booking.objects.none()

    def perform_update(self, serializer):
        user = self.request.user
        booking = serializer.instance

        if user.role == "ADMIN":
            serializer.save()
            return

        if user.role == "CUSTOMER":
            if booking.customer != user:
                raise PermissionDenied(
                    "You can only update your own bookings."
                )

            serializer.save()
            return

        raise PermissionDenied(
            "Providers cannot update bookings directly."
        )

    def perform_destroy(self, instance):
        user = self.request.user

        if user.role == "ADMIN":
            instance.delete()
            return

        if user.role == "CUSTOMER":
            if instance.customer != user:
                raise PermissionDenied(
                    "You can only delete your own bookings."
                )

            instance.delete()
            return

        raise PermissionDenied(
            "Providers cannot delete bookings."
        )

class BookingStatusUpdateView(generics.UpdateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "PROVIDER":
            return Booking.objects.filter(
                service__provider=user
            )

        if user.role == "ADMIN":
            return Booking.objects.all()

        return Booking.objects.none()

    def update(self, request, *args, **kwargs):
        booking = self.get_object()
        new_status = request.data.get("status")

        if new_status not in [
            Booking.Status.ACCEPTED,
            Booking.Status.REJECTED,
        ]:
            return Response(
                {
                    "detail": "Status must be ACCEPTED or REJECTED."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if booking.status != Booking.Status.PENDING:
            return Response(
                {
                    "detail": "Only pending bookings can be accepted or rejected."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = new_status
        booking.save(update_fields=["status"])

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_200_OK,
        )

class BookingCancelView(generics.UpdateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            customer=self.request.user,
            status=Booking.Status.PENDING,
        )

    def update(self, request, *args, **kwargs):
        booking = self.get_object()

        booking.status = Booking.Status.CANCELLED
        booking.save(update_fields=["status"])

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_200_OK,
        )

class BookingCompleteView(generics.UpdateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            service__provider=self.request.user,
            status=Booking.Status.ACCEPTED,
        )

    def update(self, request, *args, **kwargs):
        booking = self.get_object()

        booking.status = Booking.Status.COMPLETED
        booking.save(update_fields=["status"])

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_200_OK,
        )