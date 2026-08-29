from django.conf import settings
from django.db import models


class Provider(models.Model):
    account = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="provider_profile",
        limit_choices_to={"role": "PROVIDER"},
    )

    business_name = models.CharField(max_length=255)

    bio = models.TextField(blank=True)

    phone = models.CharField(max_length=20, blank=True)

    address = models.CharField(max_length=255, blank=True)

    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.business_name