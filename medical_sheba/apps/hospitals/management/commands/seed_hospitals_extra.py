from django.core.management.base import BaseCommand
from apps.hospitals.models import Hospital
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seed additional hospital data'

    def handle(self, *args, **options):
        # Check if we already have enough hospitals
        hospital_count = Hospital.objects.count()
        if hospital_count >= 61:
            self.stdout.write(self.style.SUCCESS(f'Already have {hospital_count} hospitals. No need to add more.'))
            return

        # Create 5 additional hospitals
        hospitals_data = [
            {
                'name': 'Elite Care Hospital',
                'type': 'private',
                'phone_primary': '+880-1800-111111',
                'emergency_available': True,
                'district': 'Dhaka',
                'address': 'Bashundhara, Dhaka',
                'website': 'https://elitecare.bd',
                'latitude': Decimal('23.8141'),
                'longitude': Decimal('90.4373'),
            },
            {
                'name': 'United Medical Center',
                'type': 'private',
                'phone_primary': '+880-1800-222222',
                'emergency_available': True,
                'district': 'Dhaka',
                'address': 'Gulshan, Dhaka',
                'website': 'https://unitedmedical.bd',
                'latitude': Decimal('23.8118'),
                'longitude': Decimal('90.4229'),
            },
            {
                'name': 'Sunrise Health Institute',
                'type': 'private',
                'phone_primary': '+880-1800-333333',
                'emergency_available': False,
                'district': 'Dhaka',
                'address': 'Banani, Dhaka',
                'website': 'https://sunrisehealth.bd',
                'latitude': Decimal('23.7967'),
                'longitude': Decimal('90.3959'),
            },
            {
                'name': 'Prime Hospital Network',
                'type': 'private',
                'phone_primary': '+880-1800-444444',
                'emergency_available': True,
                'district': 'Dhaka',
                'address': 'Mohakhali, Dhaka',
                'website': 'https://primehospital.bd',
                'latitude': Decimal('23.7738'),
                'longitude': Decimal('90.3884'),
            },
            {
                'name': 'Advanced Care Medical Center',
                'type': 'private',
                'phone_primary': '+880-1800-555555',
                'emergency_available': True,
                'district': 'Dhaka',
                'address': 'Rampura, Dhaka',
                'website': 'https://advancedcare.bd',
                'latitude': Decimal('23.8072'),
                'longitude': Decimal('90.4285'),
            },
        ]

        created_count = 0
        for data in hospitals_data:
            hospital, created = Hospital.objects.get_or_create(
                name=data['name'],
                defaults={
                    'type': data['type'],
                    'phone_primary': data['phone_primary'],
                    'emergency_available': data['emergency_available'],
                    'district': data['district'],
                    'address': data['address'],
                    'website': data['website'],
                    'latitude': data['latitude'],
                    'longitude': data['longitude'],
                    'is_active': True,
                    'is_verified': True,
                    'image_url': 'https://images.unsplash.com/photo-1587745914519-3e0f623fd1b5?w=400&h=300&fit=crop',
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created hospital: {hospital.name}'))

        final_count = Hospital.objects.count()
        self.stdout.write(self.style.SUCCESS(f'✓ Added {created_count} new hospitals. Total hospitals: {final_count}'))
