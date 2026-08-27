from django.urls import path
from .views import (
    BookingListCreateView,
    BookingDetailView,
    BookingStatusUpdateView,
    BookingCancelView,
    BookingCompleteView,
)
urlpatterns = [
    path(
        "",
        BookingListCreateView.as_view(),
        name="bookings-list-create",
    ),
    path(
        "<int:pk>/",
        BookingDetailView.as_view(),
        name="bookings-detail",
    ),
    path(
        "<int:pk>/status/",
        BookingStatusUpdateView.as_view(),
        name="bookings-status-update",
    ),
    path(
        "<int:pk>/cancel/",
        BookingCancelView.as_view(),
        name="bookings-cancel",
    ),
    path(
        "<int:pk>/complete/",
        BookingCompleteView.as_view(),
        name="bookings-complete",
    ),

]