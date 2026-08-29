from rest_framework import serializers

from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id",
            "account",
            "phone",
            "address",
            "bio",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "account",
            "created_at",
        ]