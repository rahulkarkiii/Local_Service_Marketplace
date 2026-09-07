from rest_framework import serializers
from django.db.models import Avg
from .models import Provider, Availability
from .geocoding import geocode_address


class ProviderSerializer(serializers.ModelSerializer):
    distance_km = serializers.FloatField(
        read_only=True,
        required=False
    )
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    geocoding_warning = serializers.SerializerMethodField()

    class Meta:
        model = Provider
        fields = [
            "id",
            "account",
            "business_name",
            "bio",
            "experience_years",
            "phone",
            "address",
            "latitude",
            "longitude",
            "distance_km",
            "is_verified",
            "average_rating",
            "review_count",
            "geocoding_warning",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "account",
            "is_verified",
            "created_at",
        ]

    def get_geocoding_warning(self, obj):
        return getattr(self, "_geocoding_warning", None)

    def create(self, validated_data):
        self._maybe_geocode(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        address_changed = (
                "address" in validated_data
                and validated_data["address"] != instance.address
        )
        missing_coords = instance.latitude is None or instance.longitude is None

        if address_changed or missing_coords:
            self._maybe_geocode(validated_data, instance=instance)

        return super().update(instance, validated_data)

    def _maybe_geocode(self, validated_data, instance=None):
        if "latitude" in validated_data or "longitude" in validated_data:
            return

        address = validated_data.get("address", getattr(instance, "address", None))
        if not address:
            return

        latitude, longitude = geocode_address(address)

        if latitude is not None and longitude is not None:
            validated_data["latitude"] = latitude
            validated_data["longitude"] = longitude
        else:
            self._geocoding_warning = (
                f"Could not determine coordinates for address '{address}'. "
                "You can set latitude/longitude manually, or check the address "
                "for typos."
            )

    def get_average_rating(self, obj):
        result = obj.account.services.aggregate(avg=Avg("reviews__rating"))["avg"]
        return round(result, 2) if result is not None else None

    def get_review_count(self, obj):
        return sum(service.reviews.count() for service in obj.account.services.all())


class ProviderVerifySerializer(serializers.Serializer):
    is_verified = serializers.BooleanField(required=False, default=True)


class AvailabilitySerializer(serializers.ModelSerializer):
    weekday_display = serializers.CharField(
        source="get_weekday_display", read_only=True
    )

    class Meta:
        model = Availability
        fields = [
            "id",
            "provider",
            "weekday",
            "weekday_display",
            "start_time",
            "end_time",
            "created_at",
        ]
        read_only_fields = ["id", "provider", "created_at"]

    def validate(self, attrs):
        start_time = attrs.get(
            "start_time", getattr(self.instance, "start_time", None)
        )
        end_time = attrs.get(
            "end_time", getattr(self.instance, "end_time", None)
        )
        weekday = attrs.get(
            "weekday", getattr(self.instance, "weekday", None)
        )

        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError(
                "end_time must be after start_time."
            )

        request = self.context.get("request")
        if request and weekday is not None and start_time and end_time:
            provider = request.user

            overlapping = Availability.objects.filter(
                provider=provider,
                weekday=weekday,
                start_time__lt=end_time,
                end_time__gt=start_time,
            )

            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)

            if overlapping.exists():
                raise serializers.ValidationError(
                    "This slot overlaps with an existing availability slot."
                )

        return attrs