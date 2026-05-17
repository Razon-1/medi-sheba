from django.core.management.base import BaseCommand
from apps.ambulance.models import AmbulanceService
from apps.location.models import District
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seed additional ambulance data'

    def handle(self, *args, **options):
        # Check if we already have enough ambulances
        ambulance_count = AmbulanceService.objects.count()
        if ambulance_count >= 30:
            self.stdout.write(self.style.SUCCESS(f'Already have {ambulance_count} ambulances. No need to add more.'))
            return

        # Get or create a district
        try:
            dhaka = District.objects.get(name__icontains='Dhaka')
        except District.DoesNotExist:
            self.stdout.write(self.style.ERROR('Dhaka district not found. Please create it first.'))
            return

        # Create 5 additional ambulances
        ambulances_data = [
            {
                'name': 'VitaLife Ambulance Service',
                'vehicle_type': 'icu',
                'driver_name': 'Tauhid Mahmud',
                'phone_number': '+880-1900-777777',
                'cost_per_km': Decimal('30.00'),
                'address': 'Manikdi, Dhaka',
                'is_available': True,
                'rating': Decimal('4.7'),
                'latitude': Decimal('23.7837'),
                'longitude': Decimal('90.3740'),
            },
            {
                'name': 'Express Medical Transport',
                'vehicle_type': 'advanced',
                'driver_name': 'Ibrahim Ahmed',
                'phone_number': '+880-1900-888888',
                'cost_per_km': Decimal('28.00'),
                'address': 'Kamrangirchar, Dhaka',
                'is_available': True,
                'rating': Decimal('4.6'),
                'latitude': Decimal('23.8180'),
                'longitude': Decimal('90.2950'),
            },
            {
                'name': 'Guardian Emergency Care',
                'vehicle_type': 'icu',
                'driver_name': 'Kamal Hassan',
                'phone_number': '+880-1900-999999',
                'cost_per_km': Decimal('32.00'),
                'address': 'Buriganga, Dhaka',
                'is_available': True,
                'rating': Decimal('4.8'),
                'latitude': Decimal('23.7676'),
                'longitude': Decimal('90.3613'),
            },
            {
                'name': 'Swift Medical Ambulance',
                'vehicle_type': 'basic',
                'driver_name': 'Salim Khan',
                'phone_number': '+880-1900-111222',
                'cost_per_km': Decimal('20.00'),
                'address': 'Lalbagh, Dhaka',
                'is_available': True,
                'rating': Decimal('4.5'),
                'latitude': Decimal('23.7733'),
                'longitude': Decimal('90.3613'),
            },
            {
                'name': 'CareNet Emergency Service',
                'vehicle_type': 'advanced',
                'driver_name': 'Raquib Hasan',
                'phone_number': '+880-1900-222333',
                'cost_per_km': Decimal('27.00'),
                'address': 'Sadarghat, Dhaka',
                'is_available': True,
                'rating': Decimal('4.7'),
                'latitude': Decimal('23.7589'),
                'longitude': Decimal('90.3654'),
            },
        ]

        created_count = 0
        for data in ambulances_data:
            ambulance, created = AmbulanceService.objects.get_or_create(
                name=data['name'],
                defaults={
                    'vehicle_type': data['vehicle_type'],
                    'driver_name': data['driver_name'],
                    'phone_number': data['phone_number'],
                    'cost_per_km': data['cost_per_km'],
                    'district': dhaka,
                    'address': data['address'],
                    'latitude': data['latitude'],
                    'longitude': data['longitude'],
                    'is_available': data['is_available'],
                    'rating': data['rating'],
                    'review_count': 100,
                    'is_verified': True,
                    'image_url': 'https://images.unsplash.com/photo-1586854692186-e5b8a9dbbd16?w=400&h=300&fit=crop',
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created ambulance: {ambulance.name}'))

        final_count = AmbulanceService.objects.count()
        self.stdout.write(self.style.SUCCESS(f'✓ Added {created_count} new ambulances. Total ambulances: {final_count}'))
