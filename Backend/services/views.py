from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Service
from .serializers import ServiceSerializer


class ServiceListCreateView(generics.ListCreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != "PROVIDER":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "Only providers can create services."
            )

        serializer.save(provider=self.request.user)


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        user = self.request.user

        if user.role == "ADMIN":
            serializer.save()
            return

        if user.role != "PROVIDER":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "Only providers can update services."
            )

        if serializer.instance.provider != user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "You can only update your own services."
            )

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        if user.role == "ADMIN":
            instance.delete()
            return

        if user.role != "PROVIDER":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "Only providers can delete services."
            )

        if instance.provider != user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "You can only delete your own services."
            )

        instance.delete()