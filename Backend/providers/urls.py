from django.urls import path

from .views import (
    ProviderListCreateView,
    ProviderDetailView,
    ProviderVerifyView,
    AvailabilityListCreateView,
    AvailabilityDetailView,
)


urlpatterns = [
    path(
        "",
        ProviderListCreateView.as_view(),
        name="provider-list-create",
    ),
    path(
        "<int:pk>/",
        ProviderDetailView.as_view(),
        name="provider-detail",
    ),
    path(
        "<int:pk>/verify/",
        ProviderVerifyView.as_view(),
        name="provider-verify",
    ),
path(
        "availability/",
        AvailabilityListCreateView.as_view(),
        name="availability-list-create",
    ),
    path(
        "availability/<int:pk>/",
        AvailabilityDetailView.as_view(),
        name="availability-detail",
    ),
]