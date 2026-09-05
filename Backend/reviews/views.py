from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import Review
from .serializers import ReviewSerializer
from notifications.services import create_notification


class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        if user.role != "CUSTOMER":
            raise PermissionDenied(
                "Only customers can create reviews."
            )

        booking = serializer.validated_data["booking"]
        service = serializer.validated_data["service"]

        if booking.customer != user:
            raise PermissionDenied(
                "You can only review your own bookings."
            )

        if booking.status != "COMPLETED":
            raise ValidationError(
                "You can only review completed bookings."
            )

        if booking.service != service:
            raise ValidationError(
                "The booking does not belong to this service."
            )

        if Review.objects.filter(booking=booking).exists():
            raise ValidationError(
                "This booking has already been reviewed."
            )

        review = serializer.save(customer=user)

        create_notification(
            recipient=service.provider,
            notification_type="REVIEW",
            title="New review received",
            message=(
                f"{user.username} left a {review.rating}-star review "
                f"for {service.title}."
            ),
        )


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        user = self.request.user
        review = serializer.instance

        if user.role == "ADMIN":
            serializer.save()
            return

        if review.customer != user:
            raise PermissionDenied(
                "You can only update your own reviews."
            )

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        if user.role == "ADMIN":
            instance.delete()
            return

        if instance.customer != user:
            raise PermissionDenied(
                "You can only delete your own reviews."
            )

        instance.delete()