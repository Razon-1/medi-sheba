#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection

cursor = connection.cursor()

print("Adding payment_id foreign key to payment_intents table...")

try:
    cursor.execute("""
        ALTER TABLE payment_intents 
        ADD COLUMN payment_id INT NOT NULL UNIQUE,
        ADD FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
    """)
    print("  ✓ Added payment_id column with foreign key constraint")
except Exception as e:
    print(f"  ✗ Error: {e}")

print("\nDone!")
