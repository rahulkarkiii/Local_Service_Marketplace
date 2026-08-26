from rest_framework import serializers

from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = [
            "id",
            "provider",
            "title",
            "description",
            "category",
            "price",
            "duration",
            "location",
            "is_active",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "provider",
            "created_at",
        ]