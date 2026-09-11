from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated

from .models import Customer
from .serializers import CustomerSerializer


class CustomerListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "ADMIN":
            return Customer.objects.all()

        return Customer.objects.filter(account=user)

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


