from django.core.management.base import BaseCommand
from apps.doctors.models import Doctor
from apps.hospitals.models import Hospital
from apps.users.models import User
from apps.location.models import District
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Add more doctors to reach 25 total'

    def handle(self, *args, **kwargs):
        # Get or create districts
        dhaka, _ = District.objects.get_or_create(name='Dhaka')
        chittagong, _ = District.objects.get_or_create(name='Chittagong')
        sylhet, _ = District.objects.get_or_create(name='Sylhet')
        
        # Get hospitals
        hospitals = list(Hospital.objects.all())
        if not hospitals:
            self.stdout.write(self.style.WARNING('No hospitals found. Please seed hospitals first.'))
            return
        
        specialties = [
            'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology',
            'ENT', 'Dermatology', 'Psychiatry', 'Ophthalmology', 'General'
        ]
        
        # Additional doctor data (will add to existing)
        additional_doctors = [
            ('Dr. Arjun Dutta', '1234567815', 'Cardiology'),
            ('Dr. Priya Sharma', '1234567816', 'Gynecology'),
            ('Dr. Vikram Singh', '1234567817', 'Neurology'),
            ('Dr. Ananya Patel', '1234567818', 'Pediatrics'),
            ('Dr. Rohan Verma', '1234567819', 'Orthopedics'),
            ('Dr. Divya Nair', '1234567820', 'ENT'),
        ]
        
        # Current count
        current_count = Doctor.objects.count()
        doctors_needed = max(0, 25 - current_count)
        
        if doctors_needed <= 0:
            self.stdout.write(self.style.WARNING(f'Already have {current_count} doctors. No need to add more.'))
            return
        
        created_count = 0
        for idx, (name, bmdc_number, specialty) in enumerate(additional_doctors[:doctors_needed]):
            parts = name.split('. ', 1)
            if len(parts) == 2:
                first_name, last_name = parts[1].rsplit(' ', 1)
            else:
                first_name, last_name = name.rsplit(' ', 1)
            
            # Create user if not exists
            user, _ = User.objects.get_or_create(
                email=f"{first_name.lower()}{last_name.lower()}@hospital.test",
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'phone': f'01{random.randint(100000000, 999999999)}',
                    'is_active': True,
                    'is_verified': True,
                }
            )
            
            # Create doctor
            doctor, created = Doctor.objects.get_or_create(
                bmdc_number=bmdc_number,
                defaults={
                    'user': user,
                    'specialty': specialty,
                    'qualifications': 'MBBS, MD',
                    'experience_years': random.randint(2, 20),
                    'hospital': random.choice(hospitals),
                    'consultation_fee': Decimal(str(random.randint(300, 1500))),
                    'is_available': True,
                    'is_verified': random.choice([True, True, True, False]),
                    'rating': Decimal(str(round(random.uniform(3.5, 5.0), 1))),
                    'review_count': random.randint(5, 100),
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created doctor: {name}'))
            else:
                self.stdout.write(f'• Doctor already exists: {name}')
        
        # Get total count
        total_doctors = Doctor.objects.count()
        self.stdout.write(self.style.SUCCESS(f'\nTotal doctors: {total_doctors}'))
