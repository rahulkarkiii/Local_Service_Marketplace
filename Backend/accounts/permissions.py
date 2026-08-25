from rest_framework.permissions import BasePermission


class IsActiveAccount(BasePermission):
    message = "Active account authentication is required."

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
        )


class IsAdmin(BasePermission):
    message = "Admin access is required."

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.role == user.Role.ADMIN
        )


class IsCustomer(BasePermission):
    message = "Customer access is required."

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.role == user.Role.CUSTOMER
        )


class IsProvider(BasePermission):
    message = "Provider access is required."

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.role == user.Role.PROVIDER
        )


class IsCustomerOrProvider(BasePermission):
    message = "Customer or provider access is required."

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.role in (
                user.Role.CUSTOMER,
                user.Role.PROVIDER,
            )
        )


class IsAccountOwner(BasePermission):
    message = "You can only access your own account."

    def has_object_permission(self, request, view, obj):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and obj == user
        )