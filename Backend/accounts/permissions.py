from rest_framework.permissions import BasePermission

from .models import Account


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == Account.Role.CUSTOMER
        )


class IsProvider(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == Account.Role.PROVIDER
        )


class IsVerifiedProvider(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == Account.Role.PROVIDER
            and hasattr(request.user, "provider_profile")
            and request.user.provider_profile.is_verified
        )


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == Account.Role.ADMIN
        )


class IsCustomerOrProvider(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in [
                Account.Role.CUSTOMER,
                Account.Role.PROVIDER,
            ]
        )