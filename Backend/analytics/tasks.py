from django.db.models import Sum
from django.utils import timezone

from accounts.models import Account
from bookings.models import Booking
from payments.models import Payment
from reports.models import Report
from services.models import Service

from .models import Analytics


def generate_daily_analytics_snapshot():
    today = timezone.localdate()

    total_users = Account.objects.count()
    total_customers = Account.objects.filter(role="CUSTOMER").count()
    total_providers = Account.objects.filter(role="PROVIDER").count()
    total_services = Service.objects.count()

    total_bookings = Booking.objects.count()
    completed_bookings = Booking.objects.filter(
        status=Booking.Status.COMPLETED
    ).count()
    pending_bookings = Booking.objects.filter(
        status=Booking.Status.PENDING
    ).count()

    total_payments = Payment.objects.count()
    total_revenue = Payment.objects.filter(
        status=Payment.Status.COMPLETED
    ).aggregate(total=Sum("amount"))["total"] or 0

    total_reports = Report.objects.count()

    Analytics.objects.update_or_create(
        date=today,
        defaults={
            "total_users": total_users,
            "total_customers": total_customers,
            "total_providers": total_providers,
            "total_services": total_services,
            "total_bookings": total_bookings,
            "total_payments": total_payments,
            "total_reports": total_reports,
            "completed_bookings": completed_bookings,
            "pending_bookings": pending_bookings,
            "total_revenue": total_revenue,
        },
    )

    return f"Analytics snapshot saved for {today}."