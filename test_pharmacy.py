import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.emedicine.models import EMedicinePharmacy

User = get_user_model()

# Test with the pharmacy admin users
pharmacy_admins = User.objects.filter(roles__contains='pharmacy_admin')

print(f"Found {pharmacy_admins.count()} pharmacy admins\n")

for user in pharmacy_admins:
    print(f'Testing user: {user.email}')
    print(f'Roles: {user.roles}')
    print(f'Has pharmacy_admin role: {"pharmacy_admin" in user.roles}')
    
    try:
        pharmacy = EMedicinePharmacy.objects.get(admin_user=user)
        print(f'✓ Pharmacy found: {pharmacy.name}')
    except EMedicinePharmacy.DoesNotExist:
        print(f'✗ No pharmacy assigned')
    except Exception as e:
        print(f'✗ Error: {e}')
    print('---')
