from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated

from .models import Provider
from .serializers import ProviderSerializer


class ProviderListCreateView(generics.ListCreateAPIView):
    serializer_class = ProviderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Provider.objects.all()

    def perform_create(self, serializer):
        user = self.request.user

        if user.role != "PROVIDER":
            raise PermissionDenied(
                "Only providers can create provider profiles."
            )

        if Provider.objects.filter(account=user).exists():
            raise ValidationError(
                "You already have a provider profile."
            )

        serializer.save(account=user)


class ProviderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProviderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Provider.objects.all()

    def perform_update(self, serializer):
        user = self.request.user
        provider = serializer.instance

        if user.role == "ADMIN":
            serializer.save()
            return

        if user.role == "PROVIDER" and provider.account == user:
            serializer.save()
            return

        raise PermissionDenied(
            "You can only update your own provider profile."
        )

    def perform_destroy(self, instance):
        user = self.request.user

        if user.role == "ADMIN":
            instance.delete()
            return

        if user.role == "PROVIDER" and instance.account == user:
            instance.delete()
            return

        raise PermissionDenied(
            "You can only delete your own provider profile."
        )