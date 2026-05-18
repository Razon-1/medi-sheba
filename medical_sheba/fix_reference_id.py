#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection

cursor = connection.cursor()

# Fix reference_id column type
print("Fixing reference_id column type...")
try:
    cursor.execute("ALTER TABLE payments MODIFY COLUMN reference_id VARCHAR(50) NULL")
    print("  ✓ Changed reference_id from int(11) to varchar(50)")
except Exception as e:
    print(f"  ✗ Error: {e}")

print("\nDone!")
