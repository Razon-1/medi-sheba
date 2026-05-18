#!/usr/bin/env python
import os
import django
import json
import urllib.request
import urllib.error

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

# Get user and token
User = get_user_model()
user = User.objects.filter(email='admin@gmail.com').first() or User.objects.first()

if user:
    refresh = RefreshToken.for_user(user)
    token = str(refresh.access_token)
    
    # Test payment API
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    payload = {
        "amount": 465,
        "gateway": "bkash",
        "payment_type": "appointment",
        "reference_id": "1",
        "reference_type": "appointment"
    }
    
    url = "http://localhost:8000/api/payments/payments/initiate/"
    
    print(f"Testing payment API with user: {user.email}")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print("\nResponse:")
    
    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f"Status Code: {response.status}")
            print(f"Response:\n{json.dumps(result, indent=2)}")
            print("\n✅ SUCCESS! Payment API is working correctly!")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        try:
            error_data = json.loads(e.read().decode('utf-8'))
            print(f"Error details: {json.dumps(error_data, indent=2)}")
        except:
            print(f"Response: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("No users found")
