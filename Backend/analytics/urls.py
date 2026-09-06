from django.urls import path
from .views import (
    AnalyticsListCreateView,
    AnalyticsDetailView,
    AnalyticsDashboardView,
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
    path(
        "dashboard/",
        AnalyticsDashboardView.as_view(),
        name="analytics-dashboard",
    ),
]