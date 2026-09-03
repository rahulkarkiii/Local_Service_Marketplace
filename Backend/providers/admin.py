from django.contrib import admin

from .models import Provider, Availability

@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = (
        "business_name",
        "account",
        "phone",
        "is_verified",
        "created_at",
    )

    list_filter = (
        "is_verified",
        "created_at",
    )

    search_fields = (
        "business_name",
        "account__username",
        "account__email",
        "phone",
    )


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ("provider", "weekday", "start_time", "end_time")
    list_filter = ("weekday",)