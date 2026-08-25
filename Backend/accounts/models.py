import uuid

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone

from .managers import AccountManager


class Account(AbstractBaseUser, PermissionsMixin):

    class Role(models.TextChoices):
        CUSTOMER = "CUSTOMER", "Customer"
        PROVIDER = "PROVIDER", "Provider"
        ADMIN = "ADMIN", "Admin"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    email = models.EmailField(
        unique=True,
        db_index=True,
    )

    first_name = models.CharField(
        max_length=255,
    )

    last_name = models.CharField(
        max_length=255,
    )

    phone_number = models.CharField(
        max_length=20,
        blank=True,
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
        db_index=True,
    )

    is_verified = models.BooleanField(
        default=False,
        db_index=True,
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
    )

    is_staff = models.BooleanField(
        default=False,
    )

    date_joined = models.DateTimeField(
        default=timezone.now,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    objects = AccountManager()

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = []

    class Meta:
        ordering = ["-date_joined"]

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        return self.email