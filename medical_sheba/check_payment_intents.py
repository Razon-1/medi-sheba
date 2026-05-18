#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection

cursor = connection.cursor()

# Check payment_intents table columns
print("payment_intents table columns:")
cursor.execute("DESCRIBE payment_intents")
columns = cursor.fetchall()
for col in columns:
    print(f"  {col[0]:30} {col[1]}")

print("\n" + "="*60)
print("\nExpected columns from PaymentIntent model:")
expected = {
    'id': 'int auto_increment',
    'payment_id': 'int (foreign key)',
    'session_token': 'varchar(200)',
    'status': 'varchar(20)',
    'verification_attempts': 'int',
    'last_verification_at': 'datetime(6)',
    'metadata': 'json',
    'created_at': 'datetime(6)',
    'updated_at': 'datetime(6)',
    'expires_at': 'datetime(6)',
}

for col, dtype in expected.items():
    print(f"  {col:30} {dtype}")

print("\n" + "="*60)
print("\nMissing columns:")
cursor.execute("DESCRIBE payment_intents")
columns = cursor.fetchall()
existing = [col[0] for col in columns]

for col in expected.keys():
    if col not in existing:
        print(f"  ✗ {col}")

if set(expected.keys()).issubset(set(existing)):
    print("  ✓ All columns present!")
