from django.conf import settings
from django.db import models


class Customer(models.Model):
    account = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_profile",
        limit_choices_to={"role": "CUSTOMER"},
    )

    phone = models.CharField(max_length=20, blank=True)

    address = models.CharField(max_length=255, blank=True)

    bio = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.account.username