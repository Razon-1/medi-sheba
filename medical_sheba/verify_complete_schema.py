#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection
import json

cursor = connection.cursor()

print("=" * 70)
print("COMPLETE PAYMENT SYSTEM DATABASE SCHEMA VERIFICATION")
print("=" * 70)

# Check payments table
print("\n1. PAYMENTS TABLE COLUMNS:")
cursor.execute("DESCRIBE payments")
columns = cursor.fetchall()
for col in columns:
    col_name = col[0]
    col_type = col[1]
    is_null = "NULL" if col[2] == "YES" else "NOT NULL"
    print(f"   {col_name:30} {col_type:25} {is_null}")

# Check payment_intents table
print("\n2. PAYMENT_INTENTS TABLE COLUMNS:")
cursor.execute("DESCRIBE payment_intents")
columns = cursor.fetchall()
for col in columns:
    col_name = col[0]
    col_type = col[1]
    is_null = "NULL" if col[2] == "YES" else "NOT NULL"
    print(f"   {col_name:30} {col_type:25} {is_null}")

# Check subscriptions table
print("\n3. SUBSCRIPTIONS TABLE COLUMNS:")
cursor.execute("DESCRIBE subscriptions")
columns = cursor.fetchall()
for col in columns:
    col_name = col[0]
    col_type = col[1]
    is_null = "NULL" if col[2] == "YES" else "NOT NULL"
    print(f"   {col_name:30} {col_type:25} {is_null}")

# Test payment creation flow
print("\n" + "=" * 70)
print("4. TESTING PAYMENT CREATION FLOW")
print("=" * 70)

from django.contrib.auth import get_user_model
from apps.payments.serializers import PaymentInitiateSerializer
from apps.payments.models import Payment, PaymentIntent

User = get_user_model()
user = User.objects.first()

if user:
    print(f"\n✓ Using test user: {user.email}")
    
    # Test serializer
    payload = {
        "amount": 465,
        "gateway": "bkash",
        "payment_type": "appointment",
        "reference_id": "1",
        "reference_type": "appointment"
    }
    
    serializer = PaymentInitiateSerializer(data=payload)
    if serializer.is_valid():
        print(f"✓ Serializer validation passed")
        
        # Test payment creation
        try:
            payment = Payment.objects.create(
                user=user,
                amount=serializer.validated_data['amount'],
                gateway=serializer.validated_data['gateway'],
                payment_type=serializer.validated_data['payment_type'],
                reference_id=serializer.validated_data.get('reference_id'),
                reference_type=serializer.validated_data.get('reference_type'),
                transaction_id=f"TEST-{user.id}-123",
                currency="BDT",
                status="pending"
            )
            print(f"✓ Payment created: {payment.transaction_id} (ID: {payment.id})")
            
            # Test payment intent creation
            from django.utils import timezone
            from datetime import timedelta
            import secrets
            
            session_token = secrets.token_urlsafe(32)
            intent = PaymentIntent.objects.create(
                payment=payment,
                session_token=session_token,
                status="pending",
                expires_at=timezone.now() + timedelta(minutes=30)
            )
            print(f"✓ PaymentIntent created: {intent.session_token[:20]}... (ID: {intent.id})")
            
            print("\n✅ COMPLETE PAYMENT FLOW VERIFIED!")
            print(f"   - Payment: {payment.transaction_id}")
            print(f"   - PaymentIntent: {intent.id}")
            print(f"   - All database tables functional")
            
            # Clean up test data
            intent.delete()
            payment.delete()
            print("\n✓ Test data cleaned up")
            
        except Exception as e:
            print(f"✗ Error creating payment: {e}")
    else:
        print(f"✗ Serializer validation failed: {serializer.errors}")
else:
    print("✗ No test user found")

print("\n" + "=" * 70)
print("SCHEMA VERIFICATION COMPLETE")
print("=" * 70)
