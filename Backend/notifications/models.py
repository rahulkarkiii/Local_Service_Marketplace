from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPE_CHOICES = [
        ("BOOKING", "Booking"),
        ("PAYMENT", "Payment"),
        ("REVIEW", "Review"),
        ("GENERAL", "General"),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    notification_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default="GENERAL",
    )

    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient.username} - {self.title}"
