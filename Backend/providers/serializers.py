from rest_framework import serializers

from .models import Provider


class ProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provider
        fields = [
            "id",
            "account",
            "business_name",
            "bio",
            "phone",
            "address",
            "is_verified",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "account",
            "is_verified",
            "created_at",
        ]