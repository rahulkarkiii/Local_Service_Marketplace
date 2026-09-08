from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.conf import settings
from bookings.tasks import send_upcoming_booking_reminders
from analytics.tasks import generate_daily_analytics_snapshot


def start():
    scheduler = BackgroundScheduler(timezone=settings.TIME_ZONE)
    scheduler.add_job(
        send_upcoming_booking_reminders,
        trigger="interval",
        minutes=5,
        id="send_upcoming_booking_reminders",
        replace_existing=True,
    )

    scheduler.add_job(
        generate_daily_analytics_snapshot,
        trigger=CronTrigger(hour=23, minute=55),
        id="generate_daily_analytics_snapshot",
        replace_existing=True,
    )

    scheduler.start()
    print("✅ APScheduler started — background jobs are running.")
    for job in scheduler.get_jobs():
        print(f"   • {job.id} — next run at {job.next_run_time}")