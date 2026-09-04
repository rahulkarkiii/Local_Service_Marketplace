from django.urls import path

from .views import (
    ServiceListCreateView,
    ServiceDetailView,
    ServiceCategoryListCreateView,
    ServiceCategoryDetailView,
)


urlpatterns = [
    path("", ServiceListCreateView.as_view(), name="service-list-create"),
    path("<int:pk>/", ServiceDetailView.as_view(), name="service-detail"),
    path(
        "categories/",
        ServiceCategoryListCreateView.as_view(),
        name="service-category-list-create",
    ),
    path(
        "categories/<int:pk>/",
        ServiceCategoryDetailView.as_view(),
        name="service-category-detail",
    ),
]