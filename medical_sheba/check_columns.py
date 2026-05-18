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
db_columns = set()
for col in columns:
    db_columns.add(col[0])
    print(f"  {col[0]:30s} {col[1]}")

print("\nExpected columns (from model):")
from apps.payments.models import Payment
expected_columns = set()
for field in Payment._meta.get_fields():
    if hasattr(field, 'column'):
        expected_columns.add(field.column)
        print(f"  {field.column:30s}")

print("\nMissing columns:")
missing = expected_columns - db_columns
if missing:
    for col in missing:
        print(f"  ✗ {col}")
else:
    print("  ✓ All columns present!")

print("\nExtra columns:")
extra = db_columns - expected_columns
if extra:
    for col in extra:
        print(f"  + {col}")
else:
    print("  ✓ No extra columns!")
