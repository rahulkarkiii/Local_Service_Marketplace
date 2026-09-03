from math import cos, radians, atan2, sin, sqrt
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsProvider, IsAdmin
from drf_spectacular.utils import OpenApiParameter, extend_schema

from .models import Provider, Availability
from .serializers import ProviderSerializer, ProviderVerifySerializer, AvailabilitySerializer


@extend_schema(
    parameters=[
        OpenApiParameter(
            name="latitude",
            type=float,
            location=OpenApiParameter.QUERY,
            description="Search center latitude.",
            required=False,
        ),
        OpenApiParameter(
            name="longitude",
            type=float,
            location=OpenApiParameter.QUERY,
            description="Search center longitude.",
            required=False,
        ),
        OpenApiParameter(
            name="radius",
            type=float,
            location=OpenApiParameter.QUERY,
            description="Search radius in kilometers.",
            required=False,
        ),
    ]
)

class ProviderListCreateView(generics.ListCreateAPIView):
    serializer_class = ProviderSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsProvider()]

        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Provider.objects.all()

        latitude = self.request.query_params.get("latitude")
        longitude = self.request.query_params.get("longitude")
        radius = self.request.query_params.get("radius")

        if latitude is None and longitude is None and radius is None:
            return queryset

        if not latitude or not longitude or not radius:
            raise ValidationError(
                "latitude, longitude, and radius are required for location search."
            )

        try:
            latitude = float(latitude)
            longitude = float(longitude)
            radius = float(radius)
        except ValueError:
            raise ValidationError(
                "latitude, longitude, and radius must be valid numbers."
            )

        if not -90 <= latitude <= 90:
            raise ValidationError(
                "latitude must be between -90 and 90."
            )

        if not -180 <= longitude <= 180:
            raise ValidationError(
                "longitude must be between -180 and 180."
            )

        if radius <= 0:
            raise ValidationError(
                "radius must be greater than 0."
            )

        latitude_delta = radius / 111.0
        longitude_delta = radius / (
            111.0 * max(cos(radians(latitude)), 0.01)
        )

        queryset = queryset.filter(
            latitude__isnull=False,
            longitude__isnull=False,
            latitude__gte=latitude - latitude_delta,
            latitude__lte=latitude + latitude_delta,
            longitude__gte=longitude - longitude_delta,
            longitude__lte=longitude + longitude_delta,
        )

        providers = []

        for provider in queryset:
            provider_latitude = float(provider.latitude)
            provider_longitude = float(provider.longitude)

            d_lat = radians(provider_latitude - latitude)
            d_lon = radians(provider_longitude - longitude)

            a = (
                sin(d_lat / 2) ** 2
                + cos(radians(latitude))
                * cos(radians(provider_latitude))
                * sin(d_lon / 2) ** 2
            )

            c = 2 * atan2(
                sqrt(a),
                sqrt(1 - a),
            )

            distance_km = 6371.0 * c

            if distance_km <= radius:
                provider.distance_km = round(distance_km, 2)
                providers.append(provider)

        providers.sort(key=lambda provider: provider.distance_km)

        return providers

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

class ProviderVerifyView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        try:
            provider = Provider.objects.get(pk=pk)
        except Provider.DoesNotExist:
            return Response(
                {"detail": "Provider not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ProviderVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        provider.is_verified = serializer.validated_data.get("is_verified", True)
        provider.save(update_fields=["is_verified"])

        return Response(
            ProviderSerializer(provider).data,
            status=status.HTTP_200_OK,
        )

class AvailabilityListCreateView(generics.ListCreateAPIView):
    serializer_class = AvailabilitySerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsProvider()]

        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Availability.objects.all()

        provider_id = self.request.query_params.get("provider")

        if provider_id:
            return queryset.filter(provider_id=provider_id)

        if self.request.user.role == "PROVIDER":
            return queryset.filter(provider=self.request.user)

        return queryset

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)


class AvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Availability.objects.all()

    def perform_update(self, serializer):
        user = self.request.user
        instance = serializer.instance

        if user.role == "ADMIN":
            serializer.save()
            return

        if user.role == "PROVIDER" and instance.provider == user:
            serializer.save()
            return

        raise PermissionDenied(
            "You can only update your own availability slots."
        )

    def perform_destroy(self, instance):
        user = self.request.user

        if user.role == "ADMIN":
            instance.delete()
            return

        if user.role == "PROVIDER" and instance.provider == user:
            instance.delete()
            return

        raise PermissionDenied(
            "You can only delete your own availability slots."
        )