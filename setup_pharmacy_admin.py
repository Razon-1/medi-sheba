import os
import sys
import django

# Add the medical_sheba directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'medical_sheba'))
os.chdir(os.path.join(os.path.dirname(__file__), 'medical_sheba'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.emedicine.models import EMedicinePharmacy, EMedicineOrder
from datetime import datetime, timedelta

User = get_user_model()

# Create a pharmacy admin user
user_email = 'pharmacy.admin@test.com'
user, created = User.objects.get_or_create(
    email=user_email,
    defaults={
        'first_name': 'Test',
        'last_name': 'Pharmacy Admin',
        'phone': '+8801700000001',
        'roles': ['pharmacy_admin'],
        'date_of_birth': '1990-01-01',
        'password': 'password123'
    }
)

if not created:
    user.roles = ['pharmacy_admin']
    user.save()
    print(f'User updated: {user.email}')
else:
    user.set_password('password123')
    user.save()
    print(f'User created: {user.email}')

print(f'Email: {user.email}')
print(f'Password: password123')

# Assign a pharmacy to the user
pharmacy = EMedicinePharmacy.objects.filter(license_number='PHARM2024001').first()
if pharmacy:
    pharmacy.admin_user = user
    pharmacy.save()
    print(f'\nPharmacy assigned: {pharmacy.name}')
    
    # Delete existing orders for this pharmacy
    EMedicineOrder.objects.filter(pharmacy=pharmacy).delete()
    print('Old orders cleared')
    
    # Create test orders
    medicines_dict = {'Paracetamol': 2, 'Aspirin': 1}
    for i in range(3):
        status_choices = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
        status = status_choices[i % len(status_choices)]
        
        order = EMedicineOrder.objects.create(
            pharmacy=pharmacy,
            patient_name=f'Test Patient {i+1}',
            contact_phone=f'+8801700{i:06d}',
            delivery_address=f'Test Address {i+1}, Dhaka',
            urgency='normal' if i == 0 else 'urgent' if i == 1 else 'critical',
            medicines_list=medicines_dict,
            total_amount=100 + (i*50),
            status=status,
            required_date=datetime.now() + timedelta(days=1),
            notes=f'Test order {i+1}'
        )
        print(f'Order created: #{order.order_id} - Status: {status}')
    
    print(f'\nTotal orders created: 3')
else:
    print('Pharmacy not found')
