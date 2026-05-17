from django.core.management.base import BaseCommand
from apps.doctors.models import Doctor
from apps.hospitals.models import Hospital
from apps.users.models import User
from apps.location.models import District
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Seed 25 doctors for testing'

    def handle(self, *args, **kwargs):
        # Get or create districts
        dhaka, _ = District.objects.get_or_create(name='Dhaka')
        chittagong, _ = District.objects.get_or_create(name='Chittagong')
        sylhet, _ = District.objects.get_or_create(name='Sylhet')
        
        # Get hospitals
        hospitals = list(Hospital.objects.all()[:5])
        if not hospitals:
            self.stdout.write(self.style.WARNING('No hospitals found. Please seed hospitals first.'))
            return
        
        specialties = [
            'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology',
            'ENT', 'Dermatology', 'Psychiatry', 'Ophthalmology', 'General'
        ]
        
        districts = [dhaka, chittagong, sylhet]
        
        doctor_data = [
            ('Dr. Ahmed Hasan', '1234567890', 'Cardiology'),
            ('Dr. Fatima Khan', '1234567891', 'Gynecology'),
            ('Dr. Mohammad Ali', '1234567892', 'Neurology'),
            ('Dr. Samina Begum', '1234567893', 'Pediatrics'),
            ('Dr. Ibrahim Hassan', '1234567894', 'Orthopedics'),
            ('Dr. Rana Khan', '1234567895', 'Cardiology'),
            ('Dr. Karim Rahman', '1234567896', 'ENT'),
            ('Dr. Sara Ahmed', '1234567897', 'Dermatology'),
            ('Dr. Habib Ali', '1234567898', 'General'),
            ('Dr. Noor Hassan', '1234567899', 'Psychiatry'),
            ('Dr. Rashid Khan', '1234567800', 'Ophthalmology'),
            ('Dr. Aisha Rahman', '1234567801', 'Cardiology'),
            ('Dr. Hassan Hossain', '1234567802', 'Neurology'),
            ('Dr. Layla Ahmed', '1234567803', 'Gynecology'),
            ('Dr. Omar Ali', '1234567804', 'Pediatrics'),
            ('Dr. Zainab Khan', '1234567805', 'Orthopedics'),
            ('Dr. Mahmoud Hassan', '1234567806', 'ENT'),
            ('Dr. Hana Ahmed', '1234567807', 'Dermatology'),
            ('Dr. Rafe Khan', '1234567808', 'Cardiology'),
            ('Dr. Amira Hossain', '1234567809', 'Gynecology'),
            ('Dr. Samir Rahman', '1234567810', 'Neurology'),
            ('Dr. Dina Khan', '1234567811', 'Pediatrics'),
            ('Dr. Karim Hassan', '1234567812', 'Orthopedics'),
            ('Dr. Lina Ahmed', '1234567813', 'ENT'),
            ('Dr. Rafiq Khan', '1234567814', 'Psychiatry'),
        ]
        
        created_count = 0
        for idx, (name, bmdc_number, specialty) in enumerate(doctor_data, 1):
            first_name, last_name = name.split('. ', 1)[1].rsplit(' ', 1)
            
            # Create user if not exists
            user, created = User.objects.get_or_create(
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
                self.stdout.write(f'✓ Created doctor: {name}')
        
        self.stdout.write(self.style.SUCCESS(f'\nTotal doctors created/updated: {created_count}'))
