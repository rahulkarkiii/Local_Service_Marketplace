from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .services import AccountService


Account = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        validators=[validate_password],
        style={"input_type": "password"},
    )

    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = Account
        fields = [
            "email",
            "password",
            "password2",
            "first_name",
            "last_name",
            "phone_number",
            "role",
        ]

    def validate_email(self, value):
        value = value.strip().lower()

        if Account.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate_role(self, value):
        if value == Account.Role.ADMIN:
            raise serializers.ValidationError(
                "Admin account cannot be created through registration."
            )

        return value

    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")

        if password != password2:
            raise serializers.ValidationError(
                {
                    "password2": "Passwords do not match."
                }
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")

        password = validated_data.pop("password")

        account = Account.objects.create_user(
            password=password,
            **validated_data,
        )

        AccountService.send_verification_email(account)

        return account


class AccountSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(
        read_only=True,
    )

    class Meta:
        model = Account
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone_number",
            "role",
            "is_verified",
            "is_active",
            "date_joined",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "email",
            "full_name",
            "role",
            "is_verified",
            "is_active",
            "date_joined",
            "updated_at",
        ]


class UpdateAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = [
            "first_name",
            "last_name",
            "phone_number",
        ]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    new_password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        validators=[validate_password],
        style={"input_type": "password"},
    )

    new_password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        old_password = attrs.get("old_password")
        new_password = attrs.get("new_password")
        new_password2 = attrs.get("new_password2")

        if new_password != new_password2:
            raise serializers.ValidationError(
                {
                    "new_password2": "Passwords do not match."
                }
            )

        if old_password == new_password:
            raise serializers.ValidationError(
                {
                    "new_password": (
                        "New password must be different "
                        "from the old password."
                    )
                }
            )

        return attrs


class LoginSerializer(TokenObtainPairSerializer):

    username_field = Account.USERNAME_FIELD

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["email"] = user.email
        token["role"] = user.role

        return token

    def validate(self, attrs):

        data = super().validate(attrs)

        if not self.user.is_verified:
            raise serializers.ValidationError(
                {
                    "detail": (
                        "Please verify your email address "
                        "before logging in."
                    )
                }
            )

        data["user"] = AccountSerializer(
            self.user
        ).data

        return data


class VerifyEmailSerializer(serializers.Serializer):
    token = serializers.CharField(
        required=True,
        write_only=True,
    )


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=True,
    )

    def validate_email(self, value):
        return value.strip().lower()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=True,
    )

    def validate_email(self, value):
        return value.strip().lower()


class PasswordResetConfirmSerializer(serializers.Serializer):

    user_id = serializers.UUIDField(
        required=True,
        write_only=True,
    )

    token = serializers.CharField(
        required=True,
        write_only=True,
    )

    new_password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        validators=[validate_password],
        style={"input_type": "password"},
    )

    new_password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs):

        if attrs["new_password"] != attrs["new_password2"]:
            raise serializers.ValidationError(
                {
                    "new_password2": "Passwords do not match."
                }
            )

        return attrs


