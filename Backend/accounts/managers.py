from django.contrib.auth.base_user import BaseUserManager

class AccountManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(
                "Users must have an email address."
            )

        email = self.normalize_email(
            email
        ).strip().lower()

        user = self.model(
            email=email,
            **extra_fields,
        )

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)

        return user

    def create_superuser(
        self,
        email,
        password=None,
        **extra_fields,
    ):
        if not password:
            raise ValueError(
                "Superuser must have a password."
            )

        extra_fields["is_staff"] = True
        extra_fields["is_superuser"] = True
        extra_fields["is_active"] = True
        extra_fields["is_verified"] = True
        extra_fields["role"] = self.model.Role.ADMIN

        return self.create_user(
            email,
            password,
            **extra_fields,
        )

