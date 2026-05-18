#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import json

User = get_user_model()
user = User.objects.first()

if user:
    print(f"Testing payment API with user: {user.email}\n")
    
    try:
        # Create API client
        client = APIClient()
        
        # Generate JWT token for user
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        # Set authorization header
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Test the payment initiation endpoint
        payload = {
            "amount": 465,
            "gateway": "bkash",
            "payment_type": "appointment",
            "reference_id": "1",
            "reference_type": "appointment"
        }
        
        response = client.post('/api/payments/initiate/', payload, format='json')
        
        print(f"Status Code: {response.status_code}")
        print(f"\nResponse Data:")
        print(json.dumps(response.json(), indent=2, default=str))
        
        if response.status_code == 201:
            print("\n✅ SUCCESS! Payment initiation endpoint works!")
            print("\nPayment Details:")
            data = response.json()
            print(f"  - Transaction ID: {data.get('transaction_id')}")
            print(f"  - Payment ID: {data.get('payment_id')}")
            print(f"  - Session Token: {data.get('session_token')[:20]}...")
            print(f"  - Amount: {data.get('amount')} {data.get('currency')}")
            print(f"  - Status: {data.get('status')}")
        else:
            print(f"\n✗ Failed with status code: {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
else:
    print("❌ No users found in database")
