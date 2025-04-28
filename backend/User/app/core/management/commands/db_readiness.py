"""
Django command to ensure the PostgreSQL database is ready.
"""

import time

from django.core.management.base import BaseCommand
from django.db.utils import OperationalError

from psycopg import OperationalError as PsycopgOpError


class Command(BaseCommand):
    """Django command waiting for database readiness."""

    def handle(self, *args, **options):
        """Entry point for command."""
        self.stdout.write("Waiting for database readiness...")
        is_db_up = False
        while is_db_up is False:
            try:
                self.check(databases=["default"])
                is_db_up = True
            except (PsycopgOpError, OperationalError):
                self.stdout.write("Database not ready yet...")
                time.sleep(1)

        self.stdout.write(self.style.SUCCESS("Database now ready"))