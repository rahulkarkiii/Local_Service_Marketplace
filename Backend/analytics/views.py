from django.db.models import Sum, Count, Avg
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin
from accounts.models import Account
from bookings.models import Booking
from services.models import Service, ServiceCategory
from payments.models import Payment
from reviews.models import Review
from reports.models import Report

from .models import Analytics
from .serializers import AnalyticsSerializer


class AnalyticsListCreateView(generics.ListCreateAPIView):
    queryset = Analytics.objects.all()
    serializer_class = AnalyticsSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class AnalyticsDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Analytics.objects.all()
    serializer_class = AnalyticsSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class AnalyticsDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        total_users = Account.objects.count()
        total_customers = Account.objects.filter(role="CUSTOMER").count()
        total_providers = Account.objects.filter(role="PROVIDER").count()
        verified_providers = Account.objects.filter(
            role="PROVIDER", provider_profile__is_verified=True
        ).count()

        total_services = Service.objects.count()
        active_services = Service.objects.filter(is_active=True).count()
        total_categories = ServiceCategory.objects.count()

        total_bookings = Booking.objects.count()
        bookings_by_status = dict(
            Booking.objects.values_list("status").annotate(count=Count("id"))
        )

        total_payments = Payment.objects.count()
        total_revenue = Payment.objects.filter(
            status="COMPLETED"
        ).aggregate(total=Sum("amount"))["total"] or 0

        total_reviews = Review.objects.count()
        platform_average_rating = Review.objects.aggregate(
            avg=Avg("rating")
        )["avg"]

        total_reports = Report.objects.count()
        open_reports = Report.objects.filter(status="PENDING").count()
        top_providers = list(
            Payment.objects.filter(status="COMPLETED")
            .values("provider__username")
            .annotate(revenue=Sum("amount"))
            .order_by("-revenue")[:5]
        )

        return Response(
            {
                "users": {
                    "total": total_users,
                    "customers": total_customers,
                    "providers": total_providers,
                    "verified_providers": verified_providers,
                },
                "services": {
                    "total": total_services,
                    "active": active_services,
                    "categories": total_categories,
                },
                "bookings": {
                    "total": total_bookings,
                    "by_status": bookings_by_status,
                },
                "payments": {
                    "total": total_payments,
                    "total_revenue": total_revenue,
                },
                "reviews": {
                    "total": total_reviews,
                    "platform_average_rating": (
                        round(platform_average_rating, 2)
                        if platform_average_rating
                        else None
                    ),
                },
                "reports": {
                    "total": total_reports,
                    "open": open_reports,
                },
                "top_providers_by_revenue": top_providers,
            }
        )