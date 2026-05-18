#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection

cursor = connection.cursor()
cursor.execute("SELECT * FROM django_migrations WHERE app = 'payments'")
migrations = cursor.fetchall()

print("Applied migrations for 'payments' app:")
for mig in migrations:
    print(f"  {mig[2]} - {mig[3]}")
