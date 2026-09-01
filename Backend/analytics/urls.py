from django.urls import path
from .views import (
    AnalyticsListCreateView,
    AnalyticsDetailView,
)
urlpatterns = [
 path(
        "",
        AnalyticsListCreateView.as_view(),
        name="analytics-list-create",
    ),
    path(
        "<int:pk>/",
        AnalyticsDetailView.as_view(),
        name="analytics-detail",
    ),
]
