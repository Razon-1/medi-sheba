#!/usr/bin/env python
"""
Test script to verify hospital-specific payment system implementation.
Tests payment routing for:
- Doctor appointments
- E-Doctor consultations
- Ambulance services
- Subscriptions
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
# Add medical_sheba directory to path
medical_sheba_dir = os.path.join(os.path.dirname(__file__), 'medical_sheba')
sys.path.insert(0, medical_sheba_dir)
os.chdir(medical_sheba_dir)
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from apps.hospitals.models import Hospital
from apps.doctors.models import Doctor
from apps.edoctor.models import EDoctorProfile
from apps.ambulance.models import AmbulanceService
from apps.payments.models import Payment
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
import json
import uuid

User = get_user_model()

def get_auth_headers(user):
    """Get JWT authentication headers for a user"""
    refresh = RefreshToken.for_user(user)
    return {
        'HTTP_AUTHORIZATION': f'Bearer {str(refresh.access_token)}'
    }

def test_payment_system():
    """Test hospital-specific payment system"""
    print("=" * 80)
    print("TESTING HOSPITAL-SPECIFIC PAYMENT SYSTEM")
    print("=" * 80)
    
    # Create test hospitals
    print("\n1. Creating test hospitals...")
    hospital1 = Hospital.objects.create(
        name="City Hospital",
        type="private",
        address="123 Main St, Dhaka",
        district="Dhaka",
        upazila="Mirpur",
        latitude=23.8103,
        longitude=90.3563,
        phone_primary="01711111111"
    )
    hospital2 = Hospital.objects.create(
        name="General Hospital",
        type="government",
        address="456 Ocean Ave, Chittagong",
        district="Chittagong",
        upazila="Halishahar",
        latitude=22.3569,
        longitude=91.8110,
        phone_primary="01822222222"
    )
    print(f"✓ Hospital 1: {hospital1.name} (Phone: {hospital1.phone_primary})")
    print(f"✓ Hospital 2: {hospital2.name} (Phone: {hospital2.phone_primary})")
    
    # Create test user
    print("\n2. Creating test user...")
    unique_phone = f"019{uuid.uuid4().hex[:9]}"
    unique_email = f"test{uuid.uuid4().hex[:8]}@example.com"
    try:
        user = User.objects.create_user(
            email=unique_email,
            phone=unique_phone,
            password='testpass123'
        )
        print(f"✓ User created: {user.email}")
    except Exception as e:
        print(f"✗ Error creating user: {e}")
        return
    
    # Create doctors for each hospital
    print("\n3. Creating doctors in different hospitals...")
    doctor1 = Doctor.objects.create(
        user=user,
        hospital=hospital1,
        qualification="MBBS",
        specialty="General",
        consultation_fee=500
    )
    doctor2 = Doctor.objects.create(
        user=user,
        hospital=hospital2,
        qualification="MBBS",
        specialty="Cardiology",
        consultation_fee=1000
    )
    print(f"✓ Doctor 1: {doctor1.specialty} at {doctor1.hospital.name}")
    print(f"✓ Doctor 2: {doctor2.specialty} at {doctor2.hospital.name}")
    
    # Create E-Doctors for each hospital
    print("\n4. Creating E-Doctors in different hospitals...")
    edoctor1 = EDoctorProfile.objects.create(
        user=user,
        hospital=hospital1,
        consultation_fee=300
    )
    edoctor2 = EDoctorProfile.objects.create(
        user=user,
        hospital=hospital2,
        consultation_fee=400
    )
    print(f"✓ E-Doctor 1: at {edoctor1.hospital.name}")
    print(f"✓ E-Doctor 2: at {edoctor2.hospital.name}")
    
    # Create Ambulance services for each hospital
    print("\n5. Creating Ambulance services in different hospitals...")
    ambulance1 = AmbulanceService.objects.create(
        hospital=hospital1,
        vehicle_number="DA-1001",
        driver_name="Ahmed",
        driver_phone="01711111112",
        service_type="standard"
    )
    ambulance2 = AmbulanceService.objects.create(
        hospital=hospital2,
        vehicle_number="DA-2001",
        driver_name="Hassan",
        driver_phone="01822222223",
        service_type="premium"
    )
    print(f"✓ Ambulance 1: {ambulance1.vehicle_number} at {ambulance1.hospital.name}")
    print(f"✓ Ambulance 2: {ambulance2.vehicle_number} at {ambulance2.hospital.name}")
    
    # Test Payment API
    print("\n6. Testing Payment Initiation API...")
    client = APIClient()
    
    # Test 1: Appointment payment for doctor at hospital1
    print("\n  Test 1: Appointment payment (Doctor at Hospital 1)")
    payload = {
        'amount': 500,
        'gateway': 'bkash',
        'payment_type': 'appointment',
        'reference_id': doctor1.id,
        'mobile_number': '01711111111',
        'mobile_name': 'Test User'
    }
    response = client.post(
        '/api/payments/payments/initiate/',
        payload,
        format='json',
        **get_auth_headers(user)
    )
    if response.status_code == 201:
        data = response.json()
        print(f"  ✓ Payment initiated: {data.get('transaction_id')}")
        print(f"    Hospital: {data.get('hospital_name')}")
        print(f"    Payment Number: {data.get('hospital_payment_number')}")
        payment_instructions = data.get('payment_instructions', {})
        if data.get('hospital_payment_number') == hospital1.phone_primary:
            print(f"    ✓ CORRECT: Using Hospital 1 phone number")
        else:
            print(f"    ✗ ERROR: Expected {hospital1.phone_primary}, got {data.get('hospital_payment_number')}")
    else:
        print(f"  ✗ Error: {response.status_code}")
        print(f"    {response.json()}")
    
    # Test 2: Appointment payment for doctor at hospital2
    print("\n  Test 2: Appointment payment (Doctor at Hospital 2)")
    payload['reference_id'] = doctor2.id
    payload['amount'] = 1000
    response = client.post(
        '/api/payments/payments/initiate/',
        payload,
        format='json',
        **get_auth_headers(user)
    )
    if response.status_code == 201:
        data = response.json()
        print(f"  ✓ Payment initiated: {data.get('transaction_id')}")
        print(f"    Hospital: {data.get('hospital_name')}")
        print(f"    Payment Number: {data.get('hospital_payment_number')}")
        if data.get('hospital_payment_number') == hospital2.phone_primary:
            print(f"    ✓ CORRECT: Using Hospital 2 phone number")
        else:
            print(f"    ✗ ERROR: Expected {hospital2.phone_primary}, got {data.get('hospital_payment_number')}")
    else:
        print(f"  ✗ Error: {response.status_code}")
        print(f"    {response.json()}")
    
    # Test 3: E-Doctor payment for edoctor at hospital1
    print("\n  Test 3: E-Doctor payment (E-Doctor at Hospital 1)")
    payload = {
        'amount': 300,
        'gateway': 'nagad',
        'payment_type': 'edoctor',
        'reference_id': edoctor1.id,
        'mobile_number': '01711111111',
        'mobile_name': 'Test User'
    }
    response = client.post(
        '/api/payments/payments/initiate/',
        payload,
        format='json',
        **get_auth_headers(user)
    )
    if response.status_code == 201:
        data = response.json()
        print(f"  ✓ Payment initiated: {data.get('transaction_id')}")
        print(f"    Hospital: {data.get('hospital_name')}")
        print(f"    Payment Number: {data.get('hospital_payment_number')}")
        if data.get('hospital_payment_number') == hospital1.phone_primary:
            print(f"    ✓ CORRECT: Using Hospital 1 phone number")
        else:
            print(f"    ✗ ERROR: Expected {hospital1.phone_primary}, got {data.get('hospital_payment_number')}")
    else:
        print(f"  ✗ Error: {response.status_code}")
        print(f"    {response.json()}")
    
    # Test 4: Ambulance payment for ambulance at hospital2
    print("\n  Test 4: Ambulance payment (Ambulance at Hospital 2)")
    payload = {
        'amount': 500,
        'gateway': 'rocket',
        'payment_type': 'ambulance',
        'reference_id': ambulance2.id,
        'mobile_number': '01822222222',
        'mobile_name': 'Test User'
    }
    response = client.post(
        '/api/payments/payments/initiate/',
        payload,
        format='json',
        **get_auth_headers(user)
    )
    if response.status_code == 201:
        data = response.json()
        print(f"  ✓ Payment initiated: {data.get('transaction_id')}")
        print(f"    Hospital: {data.get('hospital_name')}")
        print(f"    Payment Number: {data.get('hospital_payment_number')}")
        if data.get('hospital_payment_number') == hospital2.phone_primary:
            print(f"    ✓ CORRECT: Using Hospital 2 phone number")
        else:
            print(f"    ✗ ERROR: Expected {hospital2.phone_primary}, got {data.get('hospital_payment_number')}")
    else:
        print(f"  ✗ Error: {response.status_code}")
        print(f"    {response.json()}")
    
    # Test 5: Verify payment gateway choices (should be mobile money only)
    print("\n7. Verifying payment gateway choices (mobile money only)...")
    payment = Payment.objects.first()
    if payment:
        gateways = dict(Payment.GATEWAY_CHOICES)
        print(f"  Available gateways: {list(gateways.keys())}")
        expected = ['bkash', 'nagad', 'rocket']
        if set(gateways.keys()) == set(expected):
            print(f"  ✓ CORRECT: Only mobile money gateways available")
        else:
            print(f"  ✗ ERROR: Unexpected gateways: {list(gateways.keys())}")
    
    # Test 6: Verify Payment model fields
    print("\n8. Verifying Payment model fields...")
    if hasattr(Payment, 'hospital'):
        print("  ✓ Payment.hospital field exists")
    else:
        print("  ✗ Payment.hospital field missing")
    
    if hasattr(Payment, 'hospital_payment_number'):
        print("  ✓ Payment.hospital_payment_number field exists")
    else:
        print("  ✗ Payment.hospital_payment_number field missing")
    
    # Check removed fields
    removed_fields = ['card_last_four', 'card_holder_name']
    for field in removed_fields:
        try:
            Payment._meta.get_field(field)
            print(f"  ✗ {field} should have been removed")
        except:
            print(f"  ✓ {field} correctly removed")
    
    print("\n" + "=" * 80)
    print("TESTING COMPLETE")
    print("=" * 80)

if __name__ == '__main__':
    test_payment_system()
