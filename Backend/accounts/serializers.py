from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Account


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        required=True,
        validators=[validate_password]
    )

    class Meta:
        model = Account
        fields = [
            "id",
            "username",
            "email",
            "password",
            "role",
        ]

    def validate_role(self, value):
        if value not in [
            Account.Role.CUSTOMER,
            Account.Role.PROVIDER,
        ]:
            raise serializers.ValidationError(
                "Only customer and provider accounts can be registered publicly."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = Account.objects.create_user(
            password=password,
            **validated_data
        )

        return user


class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
        ]
        read_only_fields = [
            "id",
            "role",
        ]