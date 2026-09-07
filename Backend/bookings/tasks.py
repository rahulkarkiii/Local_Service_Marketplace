from datetime import timedelta

from django.utils import timezone

from notifications.services import create_notification

from .models import Booking


def send_upcoming_booking_reminders():
    now = timezone.localtime()
    window_end = (now + timedelta(hours=1)).time()

    upcoming_bookings = Booking.objects.filter(
        status=Booking.Status.ACCEPTED,
        reminder_sent=False,
        booking_date=now.date(),
        booking_time__isnull=False,
        booking_time__gte=now.time(),
        booking_time__lte=window_end,
    ).select_related("customer", "service", "service__provider")

    reminded = 0

    for booking in upcoming_bookings:
        time_str = booking.booking_time.strftime("%I:%M %p")

        create_notification(
            recipient=booking.customer,
            notification_type="BOOKING",
            title="Upcoming booking reminder",
            message=(
                f"Reminder: your booking for {booking.service.title} "
                f"is today at {time_str}."
            ),
        )

        create_notification(
            recipient=booking.service.provider,
            notification_type="BOOKING",
            title="Upcoming booking reminder",
            message=(
                f"Reminder: you have a booking for {booking.service.title} "
                f"today at {time_str}."
            ),
        )

        booking.reminder_sent = True
        booking.save(update_fields=["reminder_sent"])
        reminded += 1

    return f"Sent reminders for {reminded} booking(s)."