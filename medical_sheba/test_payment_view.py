#!/usr/bin/env python
import os
import django
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from apps.payments.views import PaymentViewSet
import json

User = get_user_model()
user = User.objects.first()

if user:
    print(f"Testing PaymentViewSet.initiate() with user: {user.email}")
    print()
    
    try:
        # Create a test request
        factory = RequestFactory()
        payload = {
            "amount": 465,
            "gateway": "bkash",
            "payment_type": "appointment",
            "reference_id": "1",
            "reference_type": "appointment"
        }
        
        request = factory.post(
            '/api/payments/payments/initiate/',
            data=json.dumps(payload),
            content_type='application/json'
        )
        request.user = user
        
        # Call the view
        view = PaymentViewSet.as_view({'post': 'initiate'})
        response = view(request)
        
        print(f"Response status: {response.status_code}")
        print(f"Response data: {json.dumps(response.data, indent=2, default=str)}")
        
        if response.status_code == 201:
            print("\n✓ SUCCESS! Payment initiation works!")
        else:
            print(f"\n✗ Unexpected status code: {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error: {e}")
        traceback.print_exc()
else:
    print("No users found")
