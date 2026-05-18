#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection

cursor = connection.cursor()

# Add missing columns to payments table
columns_to_add = [
    ("gateway_reference", "VARCHAR(200) NULL"),
    ("verification_token", "VARCHAR(200) NULL"),
    ("card_last_four", "VARCHAR(4) NULL"),
    ("card_holder_name", "VARCHAR(100) NULL"),
    ("mobile_number", "VARCHAR(20) NULL"),
    ("mobile_name", "VARCHAR(100) NULL"),
    ("paid_at", "DATETIME(6) NULL"),
    ("refunded_at", "DATETIME(6) NULL"),
]

print("Adding missing columns to payments table...")
for col_name, col_type in columns_to_add:
    try:
        cursor.execute(f"ALTER TABLE payments ADD COLUMN {col_name} {col_type}")
        print(f"  ✓ Added {col_name}")
    except Exception as e:
        if "already exists" in str(e):
            print(f"  ✓ {col_name} already exists")
        else:
            print(f"  ✗ Error adding {col_name}: {e}")

print("\nDone!")
