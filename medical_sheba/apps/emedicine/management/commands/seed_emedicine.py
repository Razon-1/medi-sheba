from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.emedicine.models import EMedicinePharmacy, MedicineItem, EMedicineOrder
from apps.location.models import District, Upazila


class Command(BaseCommand):
    help = 'Seed e-medicine database with sample pharmacies and medicines'
    
    def handle(self, *args, **options):
        self.stdout.write('Starting e-medicine data seeding...')
        
        # Get or create Dhaka district and upazila
        dhaka_district, _ = District.objects.get_or_create(
            name='Dhaka',
            defaults={'code': '01'}
        )
        dhaka_upazila, _ = Upazila.objects.get_or_create(
            name='Dhaka Sadar',
            district=dhaka_district,
            defaults={'code': '01'}
        )
        
        # Create sample pharmacies
        pharmacies_data = [
            {
                'name': 'QuickMed Online Pharmacy',
                'pharmacy_type': 'chain',
                'license_number': 'PHARM2024001',
                'phone_number': '+880-1700-111111',
                'email': 'quickmed@example.com',
                'address': 'Gulshan, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.8112,
                'longitude': 90.4229,
                'delivery_time_hours': 24,
                'min_order_amount': 100,
                'delivery_charge': 50,
                'is_verified': True,
                'rating': 4.9,
                'review_count': 156,
            },
            {
                'name': 'LifeHealth Pharmacy',
                'pharmacy_type': 'independent',
                'license_number': 'PHARM2024002',
                'phone_number': '+880-1800-222222',
                'email': 'lifehealth@example.com',
                'address': 'Banani, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.8258,
                'longitude': 90.4105,
                'delivery_time_hours': 12,
                'min_order_amount': 150,
                'delivery_charge': 75,
                'is_verified': True,
                'rating': 4.8,
                'review_count': 98,
            },
            {
                'name': 'MediHub 24/7',
                'pharmacy_type': 'chain',
                'license_number': 'PHARM2024003',
                'phone_number': '+880-1900-333333',
                'email': 'medihub@example.com',
                'address': 'Dhanmondi, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.7598,
                'longitude': 90.3675,
                'delivery_time_hours': 24,
                'min_order_amount': 120,
                'delivery_charge': 60,
                'is_verified': True,
                'rating': 4.7,
                'review_count': 134,
            },
            {
                'name': 'Care Pharmacy Network',
                'pharmacy_type': 'hospital',
                'license_number': 'PHARM2024004',
                'phone_number': '+880-1600-444444',
                'email': 'care@example.com',
                'address': 'Mirpur, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.8103,
                'longitude': 90.3516,
                'delivery_time_hours': 6,
                'min_order_amount': 200,
                'delivery_charge': 100,
                'is_verified': False,
                'rating': 4.5,
                'review_count': 67,
            },
            {
                'name': 'Prime Medicine Delivery',
                'pharmacy_type': 'chain',
                'license_number': 'PHARM2024005',
                'phone_number': '+880-1500-555555',
                'email': 'prime@example.com',
                'address': 'Uttara, Dhaka',
                'district': dhaka_district,
                'upazila': dhaka_upazila,
                'latitude': 23.8736,
                'longitude': 90.4149,
                'delivery_time_hours': 18,
                'min_order_amount': 100,
                'delivery_charge': 45,
                'is_verified': True,
                'rating': 4.6,
                'review_count': 112,
            },
        ]
        
        pharmacies = []
        for pharmacy_data in pharmacies_data:
            pharmacy, created = EMedicinePharmacy.objects.get_or_create(
                license_number=pharmacy_data['license_number'],
                defaults=pharmacy_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created pharmacy: {pharmacy.name}'))
            pharmacies.append(pharmacy)
        
        # Create sample medicines
        medicines_data = [
            {
                'name': 'Paracetamol Tablet',
                'generic_name': 'Paracetamol',
                'manufacturer': 'Beximco',
                'medicine_type': 'tablet',
                'strength': '500',
                'strength_unit': 'mg',
                'price': 10.00,
                'description': 'Effective pain reliever and fever reducer',
                'side_effects': 'Mild stomach upset, allergic reactions',
                'precautions': 'Do not exceed 4g daily',
                'stock': 500,
            },
            {
                'name': 'Aspirin Tablet',
                'generic_name': 'Acetylsalicylic Acid',
                'manufacturer': 'ACI Pharma',
                'medicine_type': 'tablet',
                'strength': '325',
                'strength_unit': 'mg',
                'price': 12.00,
                'description': 'Anti-inflammatory and pain reliever',
                'side_effects': 'Stomach irritation, bleeding risk',
                'precautions': 'Take with food or milk',
                'stock': 350,
            },
            {
                'name': 'Amoxicillin Capsule',
                'generic_name': 'Amoxicillin',
                'manufacturer': 'Novartis',
                'medicine_type': 'capsule',
                'strength': '500',
                'strength_unit': 'mg',
                'price': 35.00,
                'description': 'Antibiotic for bacterial infections',
                'side_effects': 'Diarrhea, nausea, allergic reactions',
                'precautions': 'Complete full course, allergic to penicillin',
                'stock': 200,
            },
            {
                'name': 'Omeprazole Capsule',
                'generic_name': 'Omeprazole',
                'manufacturer': 'Abbott',
                'medicine_type': 'capsule',
                'strength': '20',
                'strength_unit': 'mg',
                'price': 25.00,
                'description': 'Reduces stomach acid',
                'side_effects': 'Headache, diarrhea',
                'precautions': 'Take before meals',
                'stock': 300,
            },
            {
                'name': 'Metformin Tablet',
                'generic_name': 'Metformin',
                'manufacturer': 'Square',
                'medicine_type': 'tablet',
                'strength': '500',
                'strength_unit': 'mg',
                'price': 15.00,
                'description': 'For diabetes management',
                'side_effects': 'Metallic taste, nausea',
                'precautions': 'Monitor blood sugar levels',
                'stock': 450,
            },
            {
                'name': 'Cough Syrup',
                'generic_name': 'Dextromethorphan',
                'manufacturer': 'Incepta',
                'medicine_type': 'syrup',
                'strength': '10',
                'strength_unit': 'ml',
                'price': 40.00,
                'description': 'Effective cough suppressant',
                'side_effects': 'Drowsiness, dizziness',
                'precautions': 'Not for children under 2 years',
                'stock': 150,
            },
            {
                'name': 'Multivitamin Syrup',
                'generic_name': 'Vitamin Complex',
                'manufacturer': 'Renata',
                'medicine_type': 'syrup',
                'strength': '5',
                'strength_unit': 'ml',
                'price': 50.00,
                'description': 'Complete vitamin and mineral supplement',
                'side_effects': 'Rare, mild nausea',
                'precautions': 'Take as directed',
                'stock': 200,
            },
            {
                'name': 'Insulin Injection',
                'generic_name': 'Insulin Human',
                'manufacturer': 'Novo Nordisk',
                'medicine_type': 'injection',
                'strength': '100',
                'strength_unit': 'iu',
                'price': 150.00,
                'description': 'For diabetes management',
                'side_effects': 'Hypoglycemia, injection site reactions',
                'precautions': 'Proper storage and injection technique required',
                'stock': 80,
            },
        ]
        
        medicines = []
        for medicine_data in medicines_data:
            medicine, created = MedicineItem.objects.get_or_create(
                name=medicine_data['name'],
                defaults=medicine_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created medicine: {medicine.name}'))
            medicines.append(medicine)
        
        # Create sample orders
        orders_data = [
            {
                'patient_name': 'Ahmed Hassan',
                'contact_phone': '+880-1700-888888',
                'delivery_address': 'House 45, Road 10, Gulshan, Dhaka',
                'pharmacy': pharmacies[0],
                'medicines_list': {
                    'medicines': [
                        {'medicine': 'Paracetamol Tablet', 'quantity': 2},
                        {'medicine': 'Aspirin Tablet', 'quantity': 1}
                    ]
                },
                'total_amount': 32.00,
                'urgency': 'normal',
                'status': 'pending',
                'required_date': timezone.now() + timezone.timedelta(days=1),
                'notes': 'Please deliver before 5 PM',
            },
            {
                'patient_name': 'Fatima Khan',
                'contact_phone': '+880-1800-999999',
                'delivery_address': 'Apt 12, Banani Apartment, Dhaka',
                'pharmacy': pharmacies[1],
                'medicines_list': {
                    'medicines': [
                        {'medicine': 'Omeprazole Capsule', 'quantity': 3},
                        {'medicine': 'Metformin Tablet', 'quantity': 2}
                    ]
                },
                'total_amount': 105.00,
                'urgency': 'urgent',
                'status': 'confirmed',
                'required_date': timezone.now(),
                'notes': 'URGENT: Need by tomorrow morning',
            },
            {
                'patient_name': 'Mohammed Rahman',
                'contact_phone': '+880-1900-777777',
                'delivery_address': 'Office Building, Dhanmondi, Dhaka',
                'pharmacy': pharmacies[2],
                'medicines_list': {
                    'medicines': [
                        {'medicine': 'Multivitamin Syrup', 'quantity': 1},
                        {'medicine': 'Cough Syrup', 'quantity': 1}
                    ]
                },
                'total_amount': 90.00,
                'urgency': 'normal',
                'status': 'shipped',
                'required_date': timezone.now() + timezone.timedelta(hours=12),
                'notes': 'Leave with security if not home',
            },
            {
                'patient_name': 'Aisha Begum',
                'contact_phone': '+880-1600-666666',
                'delivery_address': 'Mirpur Residential Complex, Dhaka',
                'pharmacy': pharmacies[3],
                'medicines_list': {
                    'medicines': [
                        {'medicine': 'Amoxicillin Capsule', 'quantity': 2}
                    ]
                },
                'total_amount': 70.00,
                'urgency': 'critical',
                'status': 'processing',
                'required_date': timezone.now() + timezone.timedelta(hours=6),
                'notes': 'Emergency, infection symptoms',
            },
            {
                'patient_name': 'Karim Ahmed',
                'contact_phone': '+880-1500-555555',
                'delivery_address': 'Uttara Housing Complex, Dhaka',
                'pharmacy': pharmacies[4],
                'medicines_list': {
                    'medicines': [
                        {'medicine': 'Paracetamol Tablet', 'quantity': 3},
                        {'medicine': 'Cough Syrup', 'quantity': 1},
                        {'medicine': 'Multivitamin Syrup', 'quantity': 1}
                    ]
                },
                'total_amount': 140.00,
                'urgency': 'normal',
                'status': 'delivered',
                'required_date': timezone.now() - timezone.timedelta(days=1),
                'notes': 'Successfully delivered yesterday',
            },
        ]
        
        for order_data in orders_data:
            order, created = EMedicineOrder.objects.get_or_create(
                patient_name=order_data['patient_name'],
                contact_phone=order_data['contact_phone'],
                defaults={k: v for k, v in order_data.items() if k not in ['patient_name', 'contact_phone']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created order: {order.order_id} for {order.patient_name}'))
        
        self.stdout.write(self.style.SUCCESS('\nE-medicine data seeding completed!'))
        self.stdout.write(self.style.SUCCESS(f'Created {len(pharmacies)} pharmacies and {len(medicines)} medicines'))
