from django.core.management.base import BaseCommand
from apps.doctors.models import Doctor
from apps.users.models import User
from decimal import Decimal
import uuid


class Command(BaseCommand):
    help = 'Seed additional doctor data'

    def handle(self, *args, **options):
        # Check if we already have enough doctors
        doctor_count = Doctor.objects.count()
        if doctor_count >= 54:
            self.stdout.write(self.style.SUCCESS(f'Already have {doctor_count} doctors. No need to add more.'))
            return

        # Create 5 additional doctors
        doctors_data = [
            {
                'first_name': 'Aisha',
                'last_name': 'Patel',
                'email': 'aisha.patel@medisheba.bd',
                'phone': '880-1701-500001',
                'specialty': 'Neurology',
                'bmdc_number': 'BMDC-2025-5001',
                'qualifications': 'MBBS, MS Neurology',
                'experience_years': 12,
                'consultation_fee': Decimal('500'),
                'rating': Decimal('4.8'),
                'review_count': 142,
            },
            {
                'first_name': 'Rajesh',
                'last_name': 'Gupta',
                'email': 'rajesh.gupta@medisheba.bd',
                'phone': '880-1701-500002',
                'specialty': 'Oncology',
                'bmdc_number': 'BMDC-2025-5002',
                'qualifications': 'MBBS, MD Oncology',
                'experience_years': 15,
                'consultation_fee': Decimal('600'),
                'rating': Decimal('4.9'),
                'review_count': 156,
            },
            {
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'email': 'priya.sharma@medisheba.bd',
                'phone': '880-1701-500003',
                'specialty': 'Dermatology',
                'bmdc_number': 'BMDC-2025-5003',
                'qualifications': 'MBBS, MD Dermatology',
                'experience_years': 10,
                'consultation_fee': Decimal('400'),
                'rating': Decimal('4.7'),
                'review_count': 128,
            },
            {
                'first_name': 'Mohammed',
                'last_name': 'Hassan',
                'email': 'mohammed.hassan@medisheba.bd',
                'phone': '880-1701-500004',
                'specialty': 'Gastroenterology',
                'bmdc_number': 'BMDC-2025-5004',
                'qualifications': 'MBBS, MD Gastroenterology',
                'experience_years': 14,
                'consultation_fee': Decimal('550'),
                'rating': Decimal('4.6'),
                'review_count': 135,
            },
            {
                'first_name': 'Fatima',
                'last_name': 'Khan',
                'email': 'fatima.khan@medisheba.bd',
                'phone': '880-1701-500005',
                'specialty': 'Endocrinology',
                'bmdc_number': 'BMDC-2025-5005',
                'qualifications': 'MBBS, MD Endocrinology',
                'experience_years': 11,
                'consultation_fee': Decimal('450'),
                'rating': Decimal('4.5'),
                'review_count': 119,
            },
        ]

        created_count = 0
        for data in doctors_data:
            # Create or get User profile
            user, created_user = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'phone': data['phone'],
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'roles': ['doctor'],
                    'is_verified': True,
                }
            )

            # Create doctor
            doctor, created = Doctor.objects.get_or_create(
                bmdc_number=data['bmdc_number'],
                defaults={
                    'user': user,
                    'specialty': data['specialty'],
                    'qualifications': data['qualifications'],
                    'experience_years': data['experience_years'],
                    'consultation_fee': data['consultation_fee'],
                    'rating': data['rating'],
                    'review_count': data['review_count'],
                    'is_verified': True,
                    'image_url': 'https://images.unsplash.com/photo-1622307479241-21e88c9cb8d8?w=300&h=300&fit=crop',
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created doctor: Dr. {user.first_name} {user.last_name}'))

        final_count = Doctor.objects.count()
        self.stdout.write(self.style.SUCCESS(f'✓ Added {created_count} new doctors. Total doctors: {final_count}'))
