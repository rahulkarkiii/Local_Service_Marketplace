from rest_framework import generics
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from accounts.permissions import IsAdmin, IsVerifiedProvider
from drf_spectacular.utils import OpenApiParameter, extend_schema

from .models import Service, ServiceCategory
from .serializers import ServiceSerializer, ServiceCategorySerializer


class ServiceCategoryListCreateView(generics.ListCreateAPIView):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsAdmin()]

        return [IsAuthenticatedOrReadOnly()]


class ServiceCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), IsAdmin()]

        return [IsAuthenticatedOrReadOnly()]


@extend_schema(
    parameters=[
        OpenApiParameter(
            name="category",
            type=int,
            location=OpenApiParameter.QUERY,
            description="Filter by category id (includes its subcategories).",
            required=False,
        ),
        OpenApiParameter(
            name="min_price",
            type=float,
            location=OpenApiParameter.QUERY,
            description="Minimum price filter.",
            required=False,
        ),
        OpenApiParameter(
            name="max_price",
            type=float,
            location=OpenApiParameter.QUERY,
            description="Maximum price filter.",
            required=False,
        ),
        OpenApiParameter(
            name="location",
            type=str,
            location=OpenApiParameter.QUERY,
            description="Partial, case-insensitive location match.",
            required=False,
        ),
    ]
)
class ServiceListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, IsVerifiedProvider]

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated()]

        return [IsAuthenticated(), IsVerifiedProvider()]

    def get_queryset(self):
        queryset = Service.objects.select_related("category", "provider").filter(
            is_active=True
        )

        category_id = self.request.query_params.get("category")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        location = self.request.query_params.get("location")

        if category_id:
            try:
                category_id = int(category_id)
            except ValueError:
                raise ValidationError("category must be a valid category id.")

            try:
                category = ServiceCategory.objects.get(pk=category_id)
            except ServiceCategory.DoesNotExist:
                raise ValidationError("category does not exist.")

            category_ids = [category.id] + list(
                category.subcategories.values_list("id", flat=True)
            )
            queryset = queryset.filter(category_id__in=category_ids)

        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                raise ValidationError("min_price must be a valid number.")

        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                raise ValidationError("max_price must be a valid number.")

        if location:
            queryset = queryset.filter(location__icontains=location)

        return queryset

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.select_related("category", "provider")
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        user = self.request.user

        if user.role == "ADMIN":
            serializer.save()
            return

        if user.role != "PROVIDER":
            raise PermissionDenied(
                "Only providers can update services."
            )

        if serializer.instance.provider != user:
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
            raise PermissionDenied(
                "Only providers can delete services."
            )

        if instance.provider != user:
            raise PermissionDenied(
                "You can only delete your own services."
            )

        instance.delete()