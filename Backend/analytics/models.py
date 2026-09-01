from django.db import models

class Analytics(models.Model):
    date= models.DateField(unique=True)

    total_users= models.PositiveIntegerField(default=0)
    total_customers= models.PositiveIntegerField(default=0)
    total_providers= models.PositiveIntegerField(default=0)
    total_services= models.PositiveIntegerField(default=0)
    total_bookings= models.PositiveIntegerField(default=0)
    total_payments= models.PositiveIntegerField(default=0)
    total_reports= models.PositiveIntegerField(default=0)

    completed_bookings= models.PositiveIntegerField(default=0)
    pending_bookings= models.PositiveIntegerField(default=0)

    total_revenue= models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Analytics - {self.date}"
