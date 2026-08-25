from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Account
from .serializers import (
    AccountSerializer,
    ChangePasswordSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    ResendVerificationSerializer,
    UpdateAccountSerializer,
    VerifyEmailSerializer,
)
from .services import AccountService


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    permission_classes = [
        permissions.AllowAny,
    ]


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UpdateAccountSerializer

        return AccountSerializer


class ChangePasswordView(APIView):
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        if not request.user.check_password(
            serializer.validated_data["old_password"]
        ):
            return Response(
                {
                    "detail": "Current password is incorrect."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        AccountService.change_password(
            account=request.user,
            new_password=serializer.validated_data[
                "new_password"
            ],
        )

        return Response(
            {
                "detail": "Password changed successfully."
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def post(self, request):

        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {
                    "detail": "Refresh token is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)

            token_user_id = str(
                token.get("user_id")
            )

            current_user_id = str(
                request.user.id
            )

            if token_user_id != current_user_id:
                return Response(
                    {
                        "detail": "You can only revoke your own refresh token."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            token.blacklist()

        except TokenError:
            return Response(
                {
                    "detail": "Invalid or expired refresh token."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "detail": "Logged out successfully."
            },
            status=status.HTTP_200_OK,
        )

class VerifyEmailView(APIView):
    permission_classes = [
        permissions.AllowAny,
    ]

    def post(self, request):
        serializer = VerifyEmailSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        account = AccountService.verify_email_token(
            serializer.validated_data["token"]
        )

        if account is None:
            return Response(
                {
                    "detail": "Invalid or expired verification token."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "detail": "Email verified successfully.",
                "user": AccountSerializer(account).data,
            },
            status=status.HTTP_200_OK,
        )


class ResendVerificationEmailView(APIView):
    permission_classes = [
        permissions.AllowAny,
    ]

    def post(self, request):
        serializer = ResendVerificationSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        email = serializer.validated_data["email"]

        try:
            account = Account.objects.get(
                email=email,
                is_active=True,
            )
        except Account.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "If an account exists with this email, "
                        "a verification email has been sent."
                    )
                },
                status=status.HTTP_200_OK,
            )

        if account.is_verified:
            return Response(
                {
                    "detail": "Email is already verified."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        AccountService.send_verification_email(account)

        return Response(
            {
                "detail": "Verification email sent."
            },
            status=status.HTTP_200_OK,
        )

class PasswordResetRequestView(APIView):
    permission_classes = [
        permissions.AllowAny,
    ]

    def post(self, request):

        serializer = PasswordResetRequestSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        email = serializer.validated_data["email"]

        try:
            account = Account.objects.get(
                email=email,
                is_active=True,
            )
        except Account.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "If an account exists with this email, "
                        "a password reset link has been sent."
                    )
                },
                status=status.HTTP_200_OK,
            )

        AccountService.send_password_reset_email(
            account
        )

        return Response(
            {
                "detail": (
                    "If an account exists with this email, "
                    "a password reset link has been sent."
                )
            },
            status=status.HTTP_200_OK,
        )

class PasswordResetConfirmView(APIView):
    permission_classes = [
        permissions.AllowAny,
    ]

    def post(self, request):

        serializer = PasswordResetConfirmSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        token = serializer.validated_data["token"]
        user_id = serializer.validated_data["user_id"]

        try:
            account = Account.objects.get(
                id=user_id,
                is_active=True,
            )
        except Account.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "Invalid or expired password reset token."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not AccountService.verify_password_reset_token(
            token,
            account,
        ):
            return Response(
                {
                    "detail": (
                        "Invalid or expired password reset token."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        AccountService.reset_password(
            account=account,
            new_password=serializer.validated_data[
                "new_password"
            ],
        )

        return Response(
            {
                "detail": "Password reset successfully."
            },
            status=status.HTTP_200_OK,
        )

