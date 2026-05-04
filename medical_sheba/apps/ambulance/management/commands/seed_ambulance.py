from django.core.management.base import BaseCommand
from apps.ambulance.models import AmbulanceService, AmbulanceRequest
from apps.location.models import District
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = 'Seed ambulance data for testing'

    def handle(self, *args, **kwargs):
        # Get Dhaka district
        dhaka, _ = District.objects.get_or_create(name='Dhaka')
        
        # Ambulance services data
        ambulance_services_data = [
            {
                'name': 'Rapid Response Ambulance',
                'vehicle_type': 'basic',
                'driver_name': 'Ahmed Khan',
                'phone_number': '+880-1700-123456',
                'email': 'rapid@ambulance.com',
                'district': dhaka,
                'address': 'Gulshan, Dhaka',
                'latitude': '23.8103',
                'longitude': '90.4125',
                'cost_per_km': '50.00',
                'is_available': True,
                'is_verified': True,
                'rating': '4.8',
                'review_count': 45,
            },
            {
                'name': 'Advanced Life Support 24/7',
                'vehicle_type': 'advanced',
                'driver_name': 'Karim Hassan',
                'phone_number': '+880-1800-234567',
                'email': 'advanced@ambulance.com',
                'district': dhaka,
                'address': 'Banani, Dhaka',
                'latitude': '23.8270',
                'longitude': '90.4182',
                'cost_per_km': '100.00',
                'is_available': True,
                'is_verified': True,
                'rating': '4.9',
                'review_count': 62,
            },
            {
                'name': 'ICU Emergency Care',
                'vehicle_type': 'icu',
                'driver_name': 'Mohammad Ali',
                'phone_number': '+880-1900-345678',
                'email': 'icu@ambulance.com',
                'district': dhaka,
                'address': 'Dhanmondi, Dhaka',
                'latitude': '23.7615',
                'longitude': '90.3789',
                'cost_per_km': '150.00',
                'is_available': True,
                'is_verified': True,
                'rating': '4.7',
                'review_count': 38,
            },
            {
                'name': 'City Medical Transport',
                'vehicle_type': 'basic',
                'driver_name': 'Rohan Das',
                'phone_number': '+880-1600-456789',
                'email': 'city@ambulance.com',
                'district': dhaka,
                'address': 'Mirpur, Dhaka',
                'latitude': '23.8050',
                'longitude': '90.3645',
                'cost_per_km': '40.00',
                'is_available': True,
                'is_verified': False,
                'rating': '4.5',
                'review_count': 28,
            },
            {
                'name': 'Emergency Medical Services',
                'vehicle_type': 'advanced',
                'driver_name': 'Salim Ahmed',
                'phone_number': '+880-1700-567890',
                'email': 'ems@ambulance.com',
                'district': dhaka,
                'address': 'Uttara, Dhaka',
                'latitude': '23.8730',
                'longitude': '90.3989',
                'cost_per_km': '90.00',
                'is_available': True,
                'is_verified': True,
                'rating': '4.6',
                'review_count': 33,
            },
        ]
        
        # Create ambulance services
        created_ambulances = []
        for data in ambulance_services_data:
            ambulance, created = AmbulanceService.objects.get_or_create(
                phone_number=data['phone_number'],
                defaults=data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created ambulance: {ambulance.name}'))
            created_ambulances.append(ambulance)
        
        # Create ambulance requests
        ambulance_requests_data = [
            {
                'patient_name': 'Rajib Khan',
                'contact_phone': '+880-1500-111111',
                'pickup_location': 'Gulshan Circle',
                'pickup_address': '123 Gulshan Avenue, Dhaka',
                'dropoff_location': 'Square Hospital',
                'vehicle_type_required': 'basic',
                'urgency': 'normal',
                'required_date': datetime.now() + timedelta(hours=1),
                'notes': 'Minor injury, stable condition',
                'ambulance': created_ambulances[0] if created_ambulances else None,
                'status': 'accepted',
            },
            {
                'patient_name': 'Fatima Begum',
                'contact_phone': '+880-1600-222222',
                'pickup_location': 'Banani Lake',
                'pickup_address': '456 Banani Road, Dhaka',
                'dropoff_location': 'Apollo Hospital',
                'vehicle_type_required': 'advanced',
                'urgency': 'urgent',
                'required_date': datetime.now() + timedelta(hours=2),
                'notes': 'Chest pain, requires advanced monitoring',
                'ambulance': created_ambulances[1] if len(created_ambulances) > 1 else None,
                'status': 'accepted',
            },
            {
                'patient_name': 'Md. Hasan',
                'contact_phone': '+880-1700-333333',
                'pickup_location': 'Dhanmondi Lake',
                'pickup_address': '789 Dhanmondi Road, Dhaka',
                'dropoff_location': 'National Hospital',
                'vehicle_type_required': 'icu',
                'urgency': 'critical',
                'required_date': datetime.now() + timedelta(minutes=30),
                'notes': 'Critical condition, requires ICU support',
                'ambulance': created_ambulances[2] if len(created_ambulances) > 2 else None,
                'status': 'on_the_way',
            },
            {
                'patient_name': 'Aisha Akter',
                'contact_phone': '+880-1800-444444',
                'pickup_location': 'Mirpur',
                'pickup_address': 'Block A, Mirpur, Dhaka',
                'dropoff_location': 'Labaid Hospital',
                'vehicle_type_required': 'basic',
                'urgency': 'normal',
                'required_date': datetime.now() + timedelta(hours=3),
                'notes': 'Routine transport for surgery',
                'ambulance': None,
                'status': 'pending',
            },
            {
                'patient_name': 'Mohammad Karim',
                'contact_phone': '+880-1900-555555',
                'pickup_location': 'Uttara',
                'pickup_address': 'Sector 12, Uttara, Dhaka',
                'dropoff_location': 'Ibn Sina Hospital',
                'vehicle_type_required': 'advanced',
                'urgency': 'urgent',
                'required_date': datetime.now() + timedelta(hours=1, minutes=30),
                'notes': 'Post-operative care needed',
                'ambulance': created_ambulances[4] if len(created_ambulances) > 4 else None,
                'status': 'accepted',
            },
        ]
        
        # Create ambulance requests
        for data in ambulance_requests_data:
            request_obj, created = AmbulanceRequest.objects.get_or_create(
                contact_phone=data['contact_phone'],
                required_date=data['required_date'],
                defaults=data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created request: {request_obj.request_id}'))
        
        self.stdout.write(self.style.SUCCESS('Ambulance data seeding completed successfully!'))
