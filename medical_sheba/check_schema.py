#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection

cursor = connection.cursor()
cursor.execute("DESCRIBE payments")
columns = cursor.fetchall()

print("Payments table columns:")
for col in columns:
    print(f"  {col[0]:30s} {col[1]}")
