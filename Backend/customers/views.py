from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated

from .models import Customer
from .serializers import CustomerSerializer


class CustomerListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Customer.objects.all()

    def perform_create(self, serializer):
        user = self.request.user

        if user.role != "CUSTOMER":
            raise PermissionDenied(
                "Only customers can create customer profiles."
            )

        if Customer.objects.filter(account=user).exists():
            raise ValidationError(
                "You already have a customer profile."
            )

        serializer.save(account=user)


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Customer.objects.all()

    def perform_update(self, serializer):
        user = self.request.user
        customer = serializer.instance

        if user.role == "ADMIN":
            serializer.save()
            return

        if user.role == "CUSTOMER" and customer.account == user:
            serializer.save()
            return

        raise PermissionDenied(
            "You can only update your own customer profile."
        )

    def perform_destroy(self, instance):
        user = self.request.user

        if user.role == "ADMIN":
            instance.delete()
            return

        if user.role == "CUSTOMER" and instance.account == user:
            instance.delete()
            return

        raise PermissionDenied(
            "You can only delete your own customer profile."
        )