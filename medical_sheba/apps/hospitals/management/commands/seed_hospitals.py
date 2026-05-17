from django.core.management.base import BaseCommand
from apps.hospitals.models import Hospital
from apps.location.models import District
from apps.users.models import User
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Seed 25 hospitals for testing'

    def handle(self, *args, **kwargs):
        # Get or create districts with codes
        districts_data = [
            ('Dhaka', 'DH'),
            ('Chittagong', 'CT'),
            ('Sylhet', 'SY'),
            ('Khulna', 'KH'),
            ('Rajshahi', 'RJ'),
            ('Mymensingh', 'MY'),
            ('Rangpur', 'RG'),
            ('Barisal', 'BR')
        ]
        
        districts = []
        for district_name, code in districts_data:
            district, _ = District.objects.get_or_create(
                name=district_name,
                defaults={'code': code}
            )
            districts.append(district)
        
        hospital_types = ['government', 'private', 'clinic', 'clinic']
        
        hospital_data = [
            ('City General Hospital', 'government', 'Dhaka', 'Gulshan, Dhaka'),
            ('Carefull Medical', 'private', 'Dhaka', 'Motijheel, Dhaka'),
            ('Rajshahi Medical Center', 'private', 'Rajshahi', 'Rajshahi City'),
            ('Central Clinic', 'clinic', 'Chittagong', 'Agrabad, Chittagong'),
            ('Sylhet Care Hospital', 'private', 'Sylhet', 'Sylhet City'),
            ('Khulna Health Center', 'clinic', 'Khulna', 'Khulna City'),
            ('Mymensingh Hospital', 'government', 'Mymensingh', 'Mymensingh City'),
            ('Rangpur Medical', 'clinic', 'Rangpur', 'Rangpur City'),
            ('Barisal General Hospital', 'government', 'Barisal', 'Barisal City'),
            ('Prime Health Clinic', 'clinic', 'Dhaka', 'Banani, Dhaka'),
            ('Metro Hospital', 'private', 'Chittagong', 'GEC, Chittagong'),
            ('Sun Medical Center', 'clinic', 'Sylhet', 'Dakshin Surma, Sylhet'),
            ('Apex Hospital', 'private', 'Khulna', 'Khulna City'),
            ('Plus Nursing Home', 'private', 'Rajshahi', 'Rajshahi'),
            ('Elite Healthcare', 'private', 'Dhaka', 'Dhanmondi, Dhaka'),
            ('Quick Care Clinic', 'clinic', 'Mymensingh', 'Mymensingh'),
            ('Green Medical Center', 'clinic', 'Rangpur', 'Rangpur'),
            ('Sunshine Hospital', 'government', 'Barisal', 'Barisal'),
            ('Vision Health Clinic', 'clinic', 'Dhaka', 'Mirpur, Dhaka'),
            ('Noble Hospital', 'private', 'Chittagong', 'Halishahar, Chittagong'),
            ('Care Plus Medical', 'clinic', 'Sylhet', 'Sylhet'),
            ('Star Healthcare', 'private', 'Khulna', 'Khulna'),
            ('Excellence Clinic', 'clinic', 'Rajshahi', 'Rajshahi'),
            ('Health Hub Nursing Home', 'private', 'Dhaka', 'Lalmatia, Dhaka'),
            ('National Health Center', 'government', 'Mymensingh', 'Mymensingh'),
        ]
        
        created_count = 0
        for name, htype, district_name, address in hospital_data:
            district = next((d for d in districts if d.name == district_name), districts[0])
            
            # Create or get hospital
            hospital, created = Hospital.objects.get_or_create(
                name=name,
                defaults={
                    'type': htype,
                    'district': district_name,
                    'address': address,
                    'phone_primary': f'880{random.randint(1000000000, 9999999999)}',
                    'email': f'info@{name.lower().replace(" ", "")}hospital.bd',
                    'website': f'www.{name.lower().replace(" ", "")}hospital.bd',
                    'latitude': Decimal(str(random.uniform(21.0, 26.0))),
                    'longitude': Decimal(str(random.uniform(87.0, 93.0))),
                    'is_active': True,
                    'is_verified': random.choice([True, True, True, False]),
                    'emergency_available': True,
                    'beds_total': random.randint(20, 500),
                    'beds_available': random.randint(5, 100),
                    'rating': Decimal(str(round(random.uniform(3.5, 5.0), 1))),
                    'review_count': random.randint(10, 150),
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'✓ Created hospital: {name}')
        
        self.stdout.write(self.style.SUCCESS(f'\nTotal hospitals created/updated: {created_count}'))
