from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core import signing
from django.core.mail import send_mail

from .models import Account


password_reset_token_generator = PasswordResetTokenGenerator()


class AccountService:

    @staticmethod
    def change_password(account, new_password):
        account.set_password(new_password)

        account.save(
            update_fields=[
                "password",
                "updated_at",
            ]
        )

    @staticmethod
    def create_email_verification_token(account):
        return signing.dumps(
            {
                "user_id": str(account.id),
                "email": account.email,
            },
            salt="accounts.email-verification",
        )

    @staticmethod
    def verify_email_token(token):
        try:
            data = signing.loads(
                token,
                salt="accounts.email-verification",
                max_age=60 * 60 * 24,
            )
        except (
            signing.BadSignature,
            signing.SignatureExpired,
        ):
            return None

        try:
            account = Account.objects.get(
                id=data["user_id"],
                email=data["email"],
            )
        except Account.DoesNotExist:
            return None

        if account.is_verified:
            return account

        account.is_verified = True

        account.save(
            update_fields=[
                "is_verified",
                "updated_at",
            ]
        )

        return account

    @staticmethod
    def send_verification_email(account):
        token = AccountService.create_email_verification_token(
            account
        )

        verification_url = (
            f"{settings.FRONTEND_URL}"
            f"/verify-email/?token={token}"
        )

        send_mail(
            subject="Verify your email address",
            message=(
                "Please verify your email address by opening "
                f"this link:\n\n{verification_url}\n\n"
                "This link expires in 24 hours."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[account.email],
            fail_silently=False,
        )

    @staticmethod
    def create_password_reset_token(account):
        return password_reset_token_generator.make_token(
            account
        )

    @staticmethod
    def verify_password_reset_token(token, account):
        if not account.is_active:
            return None

        if not password_reset_token_generator.check_token(
            account,
            token,
        ):
            return None

        return account

    @staticmethod
    def send_password_reset_email(account):
        token = AccountService.create_password_reset_token(
            account
        )

        reset_url = (
            f"{settings.FRONTEND_URL}"
            f"/reset-password/?uid={account.id}"
            f"&token={token}"
        )
        send_mail(
            subject="Reset your password",
            message=(
                "You requested a password reset.\n\n"
                f"Reset your password by opening this link:\n\n"
                f"{reset_url}\n\n"
                "This link expires in 1 hour.\n\n"
                "If you did not request a password reset, "
                "you can safely ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[account.email],
            fail_silently=False,
        )

    @staticmethod
    def reset_password(account, new_password):
        account.set_password(new_password)

        account.save(
            update_fields=[
                "password",
                "updated_at",
            ]
        )
