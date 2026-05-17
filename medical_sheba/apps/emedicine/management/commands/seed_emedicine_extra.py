from django.core.management.base import BaseCommand
from apps.emedicine.models import EMedicinePharmacy
from apps.location.models import District, Upazila


class Command(BaseCommand):
    help = 'Add more pharmacies to reach 25 total'

    def handle(self, *args, **kwargs):
        # Get Dhaka district and upazila
        dhaka_district, _ = District.objects.get_or_create(
            name='Dhaka',
            defaults={'code': '01'}
        )
        dhaka_upazila, _ = Upazila.objects.get_or_create(
            name='Dhaka Sadar',
            district=dhaka_district,
            defaults={'code': '01'}
        )
        
        # Additional pharmacies data
        pharmacies_data = [
            {
                'name': 'SafeHeals Pharmacy',
                'pharmacy_type': 'chain',
                'license_number': 'PHARM2024015',
                'phone_number': '+880-1700-888899',
                'email': 'safeheals@example.com',
                'address': 'Kawran Bazar, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.7700,
                'longitude': 90.3600,
                'delivery_time_hours': 12,
                'min_order_amount': 100,
                'delivery_charge': 50,
                'is_verified': True,
                'rating': 4.6,
                'review_count': 118,
            },
            {
                'name': 'RapidMeds Online',
                'pharmacy_type': 'independent',
                'license_number': 'PHARM2024016',
                'phone_number': '+880-1800-889900',
                'email': 'rapidmeds@example.com',
                'address': 'Gulshan, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.8112,
                'longitude': 90.4229,
                'delivery_time_hours': 24,
                'min_order_amount': 120,
                'delivery_charge': 55,
                'is_verified': True,
                'rating': 4.7,
                'review_count': 125,
            },
            {
                'name': 'MediPlus Store',
                'pharmacy_type': 'chain',
                'license_number': 'PHARM2024017',
                'phone_number': '+880-1900-890011',
                'email': 'mediplus@example.com',
                'address': 'Banani, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.8258,
                'longitude': 90.4105,
                'delivery_time_hours': 18,
                'min_order_amount': 100,
                'delivery_charge': 50,
                'is_verified': True,
                'rating': 4.5,
                'review_count': 92,
            },
            {
                'name': 'HealthCare Pharmacy',
                'pharmacy_type': 'hospital',
                'license_number': 'PHARM2024018',
                'phone_number': '+880-1600-891122',
                'email': 'healthcare@example.com',
                'address': 'Dhanmondi, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.7598,
                'longitude': 90.3675,
                'delivery_time_hours': 6,
                'min_order_amount': 200,
                'delivery_charge': 100,
                'is_verified': True,
                'rating': 4.8,
                'review_count': 145,
            },
            {
                'name': 'TrustMed Pharmacy',
                'pharmacy_type': 'independent',
                'license_number': 'PHARM2024019',
                'phone_number': '+880-1500-892233',
                'email': 'trustmed@example.com',
                'address': 'Mirpur, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.8103,
                'longitude': 90.3516,
                'delivery_time_hours': 24,
                'min_order_amount': 150,
                'delivery_charge': 60,
                'is_verified': False,
                'rating': 4.4,
                'review_count': 78,
            },
            {
                'name': 'SwiftMeds Delivery',
                'pharmacy_type': 'chain',
                'license_number': 'PHARM2024020',
                'phone_number': '+880-1700-893344',
                'email': 'swiftmeds@example.com',
                'address': 'Uttara, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.8736,
                'longitude': 90.4149,
                'delivery_time_hours': 12,
                'min_order_amount': 100,
                'delivery_charge': 45,
                'is_verified': True,
                'rating': 4.7,
                'review_count': 138,
            },
            {
                'name': 'VitaPharm Online',
                'pharmacy_type': 'independent',
                'license_number': 'PHARM2024021',
                'phone_number': '+880-1800-894455',
                'email': 'vitapharm@example.com',
                'address': 'Motijheel, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.7600,
                'longitude': 90.3950,
                'delivery_time_hours': 24,
                'min_order_amount': 130,
                'delivery_charge': 55,
                'is_verified': True,
                'rating': 4.6,
                'review_count': 105,
            },
            {
                'name': 'Premier Medicine Store',
                'pharmacy_type': 'chain',
                'license_number': 'PHARM2024022',
                'phone_number': '+880-1900-895566',
                'email': 'premier@example.com',
                'address': 'Gulshan Circle, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.8170,
                'longitude': 90.4280,
                'delivery_time_hours': 18,
                'min_order_amount': 120,
                'delivery_charge': 50,
                'is_verified': True,
                'rating': 4.8,
                'review_count': 152,
            },
            {
                'name': 'CareHub Pharmacy',
                'pharmacy_type': 'hospital',
                'license_number': 'PHARM2024023',
                'phone_number': '+880-1600-896677',
                'email': 'carehub@example.com',
                'address': 'Kawran Bazar, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.7700,
                'longitude': 90.3600,
                'delivery_time_hours': 8,
                'min_order_amount': 200,
                'delivery_charge': 80,
                'is_verified': True,
                'rating': 4.7,
                'review_count': 128,
            },
            {
                'name': 'GenericPro Pharmacy',
                'pharmacy_type': 'chain',
                'license_number': 'PHARM2024024',
                'phone_number': '+880-1500-897788',
                'email': 'genericpro@example.com',
                'address': 'Banani, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.8258,
                'longitude': 90.4105,
                'delivery_time_hours': 12,
                'min_order_amount': 100,
                'delivery_charge': 48,
                'is_verified': True,
                'rating': 4.5,
                'review_count': 99,
            },
            {
                'name': 'MediConnect Pharmacy',
                'pharmacy_type': 'independent',
                'license_number': 'PHARM2024025',
                'phone_number': '+880-1700-898899',
                'email': 'mediconnect@example.com',
                'address': 'Dhanmondi, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.7598,
                'longitude': 90.3675,
                'delivery_time_hours': 24,
                'min_order_amount': 140,
                'delivery_charge': 58,
                'is_verified': False,
                'rating': 4.4,
                'review_count': 85,
            },
        ]
        
        # Create pharmacies
        created_count = 0
        for data in pharmacies_data:
            pharmacy, created = EMedicinePharmacy.objects.get_or_create(
                license_number=data['license_number'],
                defaults=data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created pharmacy: {pharmacy.name}'))
            else:
                self.stdout.write(f'• Pharmacy already exists: {pharmacy.name}')
        
        # Get total count
        total_pharmacies = EMedicinePharmacy.objects.count()
        self.stdout.write(self.style.SUCCESS(f'\nTotal pharmacies: {total_pharmacies}'))
