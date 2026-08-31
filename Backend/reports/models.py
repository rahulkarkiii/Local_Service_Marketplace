from django.db import models
from django.conf import settings

class Report(models.Model):
    REPORT_TYPE_CHOICES = [
        ("BOOKING", "Booking"),
        ("PAYMENT", "Payment"),
        ("SERVICE", "Service"),
        ("USER", "User"),
        ("OTHER", "Other"),
    ]
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("REVIEWED", "Reviewed"),
        ("RESOLVED", "Resolved"),
        ("REJECTED", "Rejected"),
    ]

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reports",
    )

    report_type = models.CharField(
        max_length=20,
        choices=REPORT_TYPE_CHOICES,
    )

    title = models.CharField(max_length=200)

    description = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

