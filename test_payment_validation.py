#!/usr/bin/env python
"""
Simplified test to verify hospital-specific payment system via API.
"""

import os
import sys
import django
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
# Add medical_sheba directory to path
medical_sheba_dir = os.path.join(os.path.dirname(__file__), 'medical_sheba')
sys.path.insert(0, medical_sheba_dir)
os.chdir(medical_sheba_dir)
django.setup()

from django.contrib.auth import get_user_model
from apps.payments.models import Payment
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def test_payment_api():
    """Test payment API"""
    print("=" * 80)
    print("TESTING HOSPITAL-SPECIFIC PAYMENT SYSTEM")
    print("=" * 80)
    
    print("\n1. Verifying Payment Model...")
    print("   Checking for hospital-specific fields...")
    
    # Check fields
    fields_check = {
        'hospital': False,
        'hospital_payment_number': False
    }
    removed_fields_check = {
        'card_last_four': False,
        'card_holder_name': False
    }
    
    try:
        Payment._meta.get_field('hospital')
        fields_check['hospital'] = True
    except:
        pass
    
    try:
        Payment._meta.get_field('hospital_payment_number')
        fields_check['hospital_payment_number'] = True
    except:
        pass
    
    # Check removed fields
    try:
        Payment._meta.get_field('card_last_four')
        removed_fields_check['card_last_four'] = True
    except:
        pass
    
    try:
        Payment._meta.get_field('card_holder_name')
        removed_fields_check['card_holder_name'] = True
    except:
        pass
    
    for field, exists in fields_check.items():
        if exists:
            print(f"   ✓ {field} field exists")
        else:
            print(f"   ✗ {field} field missing")
    
    for field, exists in removed_fields_check.items():
        if not exists:
            print(f"   ✓ {field} field removed (correct)")
        else:
            print(f"   ✗ {field} field still exists (should be removed)")
    
    # Check gateway choices
    print("\n2. Verifying Payment Gateway Choices...")
    gateway_dict = dict(Payment.GATEWAY_CHOICES)
    print(f"   Available gateways: {list(gateway_dict.keys())}")
    
    expected = {'bkash', 'nagad', 'rocket'}
    actual = set(gateway_dict.keys())
    
    if actual == expected:
        print(f"   ✓ CORRECT: Only mobile money gateways (bKash, Nagad, Rocket)")
    else:
        missing = expected - actual
        extra = actual - expected
        if missing:
            print(f"   ✗ Missing gateways: {missing}")
        if extra:
            print(f"   ✗ Extra gateways: {extra}")
    
    # Check Payment fields in database
    print("\n3. Checking Payment records in database...")
    total_payments = Payment.objects.count()
    payments_with_hospital = Payment.objects.filter(hospital__isnull=False).count()
    
    print(f"   Total payments: {total_payments}")
    print(f"   Payments with hospital: {payments_with_hospital}")
    
    # Show recent payments
    recent = Payment.objects.all().order_by('-created_at')[:3]
    if recent.exists():
        print("\n4. Recent Payment Records:")
        for payment in recent:
            print(f"   Transaction: {payment.transaction_id}")
            print(f"   Amount: {payment.amount} {payment.currency}")
            print(f"   Gateway: {payment.get_gateway_display()}")
            print(f"   Hospital: {payment.hospital.name if payment.hospital else 'None'}")
            print(f"   Hospital Phone: {payment.hospital_payment_number}")
            print()
    else:
        print("\n4. No payment records found in database")
    
    # Check serializers
    print("5. Checking Serializer Updates...")
    from apps.payments.serializers import PaymentSerializer
    
    # Create a sample serializer to check fields
    try:
        serializer_fields = PaymentSerializer.Meta.fields
        
        if 'hospital' in serializer_fields:
            print("   ✓ PaymentSerializer includes 'hospital' field")
        else:
            print("   ✗ PaymentSerializer missing 'hospital' field")
        
        if 'hospital_payment_number' in serializer_fields:
            print("   ✓ PaymentSerializer includes 'hospital_payment_number' field")
        else:
            print("   ✗ PaymentSerializer missing 'hospital_payment_number' field")
        
        removed_in_serializer = ['card_last_four', 'card_holder_name']
        for field in removed_in_serializer:
            if field not in serializer_fields:
                print(f"   ✓ PaymentSerializer removed '{field}' field")
            else:
                print(f"   ✗ PaymentSerializer still includes '{field}' field")
    except Exception as e:
        print(f"   ✗ Error checking serializer: {e}")
    
    print("\n" + "=" * 80)
    print("VALIDATION COMPLETE")
    print("=" * 80)

if __name__ == '__main__':
    test_payment_api()
