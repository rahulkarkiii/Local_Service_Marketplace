from rest_framework import serializers
from .models import Analytics

class AnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analytics
        fields = [
            "id",
            "date",
            "total_users",
            "total_customers",
            "total_providers",
            "total_services",
            "total_bookings",
            "total_payments",
            "total_reports",
            "completed_bookings",
            "pending_bookings",
            "total_revenue",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]