import os
import sys

from django.apps import AppConfig


class BookingsConfig(AppConfig):
    name = 'bookings'

    def ready(self):
        if 'runserver' not in sys.argv:
            return

        if os.environ.get('RUN_MAIN') != 'true':
            return

        from config import scheduler
        scheduler.start()