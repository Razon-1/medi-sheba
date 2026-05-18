#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.payments.models import Payment
from apps.payments.serializers import PaymentInitiateSerializer

User = get_user_model()
user = User.objects.first()

if user:
    payload = {
        "amount": 465,
        "gateway": "bkash",
        "payment_type": "appointment",
        "reference_id": "1",
        "reference_type": "appointment"
    }
    
    print(f"Testing PaymentInitiateSerializer with user: {user.email}")
    print(f"Payload: {payload}")
    print()
    
    try:
        serializer = PaymentInitiateSerializer(data=payload)
        if serializer.is_valid():
            print("✓ Serializer is valid!")
            print(f"Validated data: {serializer.validated_data}")
            
            # Try to create the payment
            try:
                payment = Payment.objects.create(
                    user=user,
                    transaction_id="TEST-123",
                    status='pending',
                    **serializer.validated_data
                )
                print(f"✓ Payment created: {payment.transaction_id}")
            except Exception as e:
                print(f"✗ Error creating payment: {e}")
                import traceback
                traceback.print_exc()
        else:
            print("✗ Serializer validation errors:")
            for field, errors in serializer.errors.items():
                for error in errors:
                    print(f"  {field}: {error}")
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
else:
    print("No users found")
