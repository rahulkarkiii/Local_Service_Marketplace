from django.db.models import Avg
from rest_framework import serializers

from .models import Service, ServiceCategory


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "parent",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ServiceSerializer(serializers.ModelSerializer):
    category_detail = ServiceCategorySerializer(source="category", read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            "id",
            "provider",
            "title",
            "description",
            "category",
            "category_detail",
            "price",
            "duration",
            "location",
            "is_active",
            "average_rating",
            "review_count",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "provider",
            "created_at",
        ]

    def get_average_rating(self, obj):
        result = obj.reviews.aggregate(avg=Avg("rating"))["avg"]
        return round(result, 2) if result is not None else None

    def get_review_count(self, obj):
        return obj.reviews.count()