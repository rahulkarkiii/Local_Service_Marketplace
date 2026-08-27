from django.conf import settings
from django.db import models

from bookings.models import Booking
from services.models import Service

class Review(models.Model):
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name= "reviews",
        limit_choices_to={"role": "CUSTOMER"},
    )

    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name= "reviews",
    )

    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name= "review",
    )

    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Review by{self.customer} - {self.rating}/5"