from django.conf import settings
from django.db import models
from bookings.models import Booking

class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        COMPLETED = "COMPLETED", "Completed"
        FAILED = "FAILED", "Failed"
        REFUNDED = "REFUNDED", "Refunded"

    class PaymentMethod(models.TextChoices):
        CASH = "CASH", "Cash"
        CARD = "CARD", "Card"
        ONLINE = "ONLINE", "Online"

    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name="payment",
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments",
        limit_choices_to={"role": "CUSTOMER"},
    )

    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_payments",
        limit_choices_to={"role": "PROVIDER"},
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    transaction_id = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.id} - {self.amount}"

