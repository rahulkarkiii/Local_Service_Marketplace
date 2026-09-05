from django.urls import path
from .views import (
    PaymentListCreateView,
    PaymentDetailView,
    ProviderEarningsView,
    PaymentInitiateView,
    PaymentVerifyView,
)

urlpatterns = [
    path(
        "",
        PaymentListCreateView.as_view(),
        name="payments_list_create",
    ),
    path(
        "earnings/",
        ProviderEarningsView.as_view(),
        name="provider-earnings",
    ),
    path(
        "<int:pk>/",
        PaymentDetailView.as_view(),
        name="payment_detail",
    ),
    path(
        "<int:pk>/initiate/",
        PaymentInitiateView.as_view(),
        name="payment-initiate",
    ),
    path(
        "<int:pk>/verify/",
        PaymentVerifyView.as_view(),
        name="payment-verify",
    ),
]