from django.core.management.base import BaseCommand
from apps.ambulance.models import AmbulanceService
from apps.location.models import District
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Add more ambulance services to reach 25 total'

    def handle(self, *args, **kwargs):
        # Get Dhaka district
        dhaka, _ = District.objects.get_or_create(name='Dhaka')
        
        # Additional ambulance services to reach 25
        ambulance_services_data = [
            {
                'name': 'MediCare Emergency Ambulance',
                'vehicle_type': 'basic',
                'driver_name': 'Habib Khan',
                'phone_number': '+880-1700-321456',
                'email': 'medicare@ambulance.com',
                'district': dhaka,
                'address': 'Gulshan, Dhaka',
                'latitude': Decimal('23.8103'),
                'longitude': Decimal('90.4125'),
                'cost_per_km': Decimal('48.00'),
                'is_available': True,
                'is_verified': True,
                'rating': Decimal('4.6'),
                'review_count': 42,
            },
            {
                'name': 'Rescue Plus Ambulance',
                'vehicle_type': 'advanced',
                'driver_name': 'Shiful Haque',
                'phone_number': '+880-1800-321567',
                'email': 'rescueplus@ambulance.com',
                'district': dhaka,
                'address': 'Banani, Dhaka',
                'latitude': Decimal('23.8270'),
                'longitude': Decimal('90.4182'),
                'cost_per_km': Decimal('92.00'),
                'is_available': True,
                'is_verified': True,
                'rating': Decimal('4.7'),
                'review_count': 55,
            },
            {
                'name': 'HealthGuard Ambulance',
                'vehicle_type': 'icu',
                'driver_name': 'Rafik Hasan',
                'phone_number': '+880-1900-321678',
                'email': 'healthguard@ambulance.com',
                'district': dhaka,
                'address': 'Dhanmondi, Dhaka',
                'latitude': Decimal('23.7615'),
                'longitude': Decimal('90.3789'),
                'cost_per_km': Decimal('155.00'),
                'is_available': True,
                'is_verified': True,
                'rating': Decimal('4.8'),
                'review_count': 68,
            },
            {
                'name': 'Speed Emergency Care',
                'vehicle_type': 'basic',
                'driver_name': 'Javed Khan',
                'phone_number': '+880-1600-321789',
                'email': 'speedcare@ambulance.com',
                'district': dhaka,
                'address': 'Mirpur, Dhaka',
                'latitude': Decimal('23.8050'),
                'longitude': Decimal('90.3645'),
                'cost_per_km': Decimal('42.00'),
                'is_available': True,
                'is_verified': True,
                'rating': Decimal('4.5'),
                'review_count': 31,
            },
            {
                'name': 'VitaCare Transport',
                'vehicle_type': 'advanced',
                'driver_name': 'Saurav Roy',
                'phone_number': '+880-1700-321890',
                'email': 'vitacare@ambulance.com',
                'district': dhaka,
                'address': 'Uttara, Dhaka',
                'latitude': Decimal('23.8730'),
                'longitude': Decimal('90.3989'),
                'cost_per_km': Decimal('88.00'),
                'is_available': True,
                'is_verified': False,
                'rating': Decimal('4.4'),
                'review_count': 29,
            },
            {
                'name': 'SafePath Ambulance',
                'vehicle_type': 'basic',
                'driver_name': 'Ibrohim Ali',
                'phone_number': '+880-1800-321901',
                'email': 'safepath@ambulance.com',
                'district': dhaka,
                'address': 'Motijheel, Dhaka',
                'latitude': Decimal('23.7600'),
                'longitude': Decimal('90.3950'),
                'cost_per_km': Decimal('52.00'),
                'is_available': True,
                'is_verified': True,
                'rating': Decimal('4.7'),
                'review_count': 47,
            },
            {
                'name': 'ProMed Emergency',
                'vehicle_type': 'icu',
                'driver_name': 'Zaman Hossain',
                'phone_number': '+880-1900-322012',
                'email': 'promed@ambulance.com',
                'district': dhaka,
                'address': 'Kawran Bazar, Dhaka',
                'latitude': Decimal('23.7700'),
                'longitude': Decimal('90.3600'),
                'cost_per_km': Decimal('158.00'),
                'is_available': True,
                'is_verified': True,
                'rating': Decimal('4.9'),
                'review_count': 74,
            },
            {
                'name': 'CarePlus Medical Transport',
                'vehicle_type': 'advanced',
                'driver_name': 'Parvez Khan',
                'phone_number': '+880-1500-322123',
                'email': 'careplus@ambulance.com',
                'district': dhaka,
                'address': 'Gulshan Circle, Dhaka',
                'latitude': Decimal('23.8170'),
                'longitude': Decimal('90.4280'),
                'cost_per_km': Decimal('94.00'),
                'is_available': True,
                'is_verified': True,
                'rating': Decimal('4.6'),
                'review_count': 51,
            },
        ]
        
        # Create ambulance services
        created_count = 0
        for data in ambulance_services_data:
            ambulance, created = AmbulanceService.objects.get_or_create(
                phone_number=data['phone_number'],
                defaults=data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created ambulance: {ambulance.name}'))
            else:
                self.stdout.write(f'• Ambulance already exists: {ambulance.name}')
        
        # Get total count
        total_ambulances = AmbulanceService.objects.count()
        self.stdout.write(self.style.SUCCESS(f'\nTotal ambulance services: {total_ambulances}'))
