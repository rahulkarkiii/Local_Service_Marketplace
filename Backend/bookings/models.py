from django.conf import settings
from  django.db import models

from services.models import Service

class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING= "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name= "bookings",
        limit_choices_to={"role": "CUSTOMER"},
    )

    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name= "bookings",
    )

    booking_date = models.DateField()
    booking_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.customer.username} - {self.service.title}"