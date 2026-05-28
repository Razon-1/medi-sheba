from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.ambulance.models import AmbulanceService
from apps.location.models import District, Upazila
from apps.payments.models import Payment, Subscription


User = get_user_model()


class Command(BaseCommand):
    help = 'Seed 22 ambulance admin accounts with services and annual subscriptions'

    password = 'Razon@123'
    image_urls = [
        'https://rsdktmadiun.com/wp-content/uploads/2025/12/ambulance.jpg',
        'https://bimcbali.com/wp-content/uploads/2024/12/The-Importance-of-Response-Time-In-Ambulance-Services.jpg',
    ]

    areas = [
        ('Gulshan', 'Gulshan Avenue, Dhaka', Decimal('23.810300'), Decimal('90.412500')),
        ('Banani', 'Road 11, Banani, Dhaka', Decimal('23.793700'), Decimal('90.406600')),
        ('Dhanmondi', 'Dhanmondi 27, Dhaka', Decimal('23.746100'), Decimal('90.374200')),
        ('Mirpur', 'Mirpur 10, Dhaka', Decimal('23.806700'), Decimal('90.368600')),
        ('Uttara', 'Sector 7, Uttara, Dhaka', Decimal('23.875900'), Decimal('90.379500')),
        ('Motijheel', 'Commercial Area, Motijheel, Dhaka', Decimal('23.733000'), Decimal('90.417200')),
        ('Badda', 'Pragati Sarani, Badda, Dhaka', Decimal('23.780600'), Decimal('90.426600')),
        ('Mohammadpur', 'Town Hall, Mohammadpur, Dhaka', Decimal('23.765800'), Decimal('90.358900')),
        ('Farmgate', 'Farmgate, Tejgaon, Dhaka', Decimal('23.756400'), Decimal('90.389000')),
        ('Wari', 'Rankin Street, Wari, Dhaka', Decimal('23.711500'), Decimal('90.417700')),
        ('Khilgaon', 'Khilgaon Chowdhury Para, Dhaka', Decimal('23.750900'), Decimal('90.424800')),
        ('Rampura', 'DIT Road, Rampura, Dhaka', Decimal('23.761000'), Decimal('90.421700')),
        ('Jatrabari', 'Jatrabari Medical Road, Dhaka', Decimal('23.710400'), Decimal('90.435200')),
        ('Lalbagh', 'Lalbagh Fort Road, Dhaka', Decimal('23.718900'), Decimal('90.388100')),
        ('Kawran Bazar', 'Kawran Bazar, Dhaka', Decimal('23.751600'), Decimal('90.393700')),
        ('Mohakhali', 'Wireless Gate, Mohakhali, Dhaka', Decimal('23.778900'), Decimal('90.397800')),
        ('Shyamoli', 'Ring Road, Shyamoli, Dhaka', Decimal('23.774800'), Decimal('90.365700')),
        ('Basabo', 'Central Basabo, Dhaka', Decimal('23.740600'), Decimal('90.429200')),
        ('Azimpur', 'Azimpur Road, Dhaka', Decimal('23.728000'), Decimal('90.385400')),
        ('Cantonment', 'Cantonment, Dhaka', Decimal('23.829700'), Decimal('90.393800')),
        ('Banasree', 'Block C, Banasree, Dhaka', Decimal('23.763200'), Decimal('90.431600')),
        ('Savar', 'Savar Bus Stand, Dhaka', Decimal('23.847900'), Decimal('90.257700')),
    ]

    driver_names = [
        'Abdul Karim', 'Rafiqul Islam', 'Mahmud Hasan', 'Jamal Uddin',
        'Nazmul Hossain', 'Shahin Alam', 'Mizan Rahman', 'Ariful Haque',
        'Sohel Rana', 'Faisal Ahmed', 'Rashed Khan', 'Tariqul Islam',
        'Imran Hossain', 'Habibur Rahman', 'Sabbir Ahmed', 'Mamun Mia',
        'Farid Uddin', 'Masud Rana', 'Kamal Hossain', 'Rubel Hasan',
        'Nayeem Islam', 'Tanvir Ahmed',
    ]

    vehicle_types = ['basic', 'advanced', 'icu']

    features = {
        'consultations_per_month': 100,
        'max_appointments': 200,
        'priority_support': True,
        'admin_tools': True,
        'ambulance_dashboard': True,
    }

    def handle(self, *args, **options):
        dhaka, _ = District.objects.get_or_create(
            name='Dhaka',
            defaults={'code': 'DHK', 'region': 'Central'},
        )
        upazila, _ = Upazila.objects.get_or_create(
            district=dhaka,
            code='DHK-SDR',
            defaults={'name': 'Dhaka Sadar'},
        )

        created_users = 0
        created_ambulances = 0
        active_until = timezone.now() + timedelta(days=365)

        with transaction.atomic():
            for index in range(1, 23):
                email = f'ambulance{index}@gmail.com'
                phone = f'+880171{index:08d}'
                area, address, latitude, longitude = self.areas[index - 1]
                vehicle_type = self.vehicle_types[(index - 1) % len(self.vehicle_types)]
                cost_per_km = {
                    'basic': Decimal('55.00'),
                    'advanced': Decimal('95.00'),
                    'icu': Decimal('155.00'),
                }[vehicle_type]

                user, user_created = User.objects.update_or_create(
                    email=email,
                    defaults={
                        'phone': phone,
                        'first_name': 'Ambulance',
                        'last_name': f'Admin {index}',
                        'roles': ['ambulance_driver_admin'],
                        'district': 'Dhaka',
                        'upazila': area,
                        'address': address,
                        'is_active': True,
                        'is_verified': True,
                        'has_made_first_payment': True,
                    },
                )
                user.set_password(self.password)
                user.save()
                created_users += int(user_created)

                ambulance, ambulance_created = AmbulanceService.objects.update_or_create(
                    admin_user=user,
                    defaults={
                        'name': f'Medi Sheba Ambulance {index:02d}',
                        'vehicle_type': vehicle_type,
                        'driver_name': self.driver_names[index - 1],
                        'phone_number': phone,
                        'email': email,
                        'district': dhaka,
                        'upazila': upazila,
                        'address': address,
                        'latitude': latitude,
                        'longitude': longitude,
                        'cost_per_km': cost_per_km,
                        'is_available': True,
                        'is_verified': True,
                        'requires_authentication': False,
                        'rating': Decimal('4.80') + Decimal((index % 3) * 5) / Decimal('100'),
                        'review_count': 40 + index * 3,
                        'image_url': self.image_urls[(index - 1) % len(self.image_urls)],
                    },
                )
                created_ambulances += int(ambulance_created)

                payment, _ = Payment.objects.update_or_create(
                    transaction_id=f'AMB-ANNUAL-{index:02d}',
                    defaults={
                        'user': user,
                        'amount': Decimal('3999.00'),
                        'currency': 'BDT',
                        'gateway': 'sslcommerz',
                        'payment_type': 'subscription',
                        'reference_type': 'ambulance_subscription',
                        'reference_id': str(ambulance.id),
                        'status': 'success',
                        'paid_at': timezone.now(),
                        'gateway_reference': f'SEED-AMB-{index:02d}',
                    },
                )

                Subscription.objects.update_or_create(
                    user=user,
                    plan='professional',
                    duration='annual',
                    defaults={
                        'amount': Decimal('3999.00'),
                        'status': 'active',
                        'end_date': active_until,
                        'renewal_date': active_until,
                        'payment': payment,
                        'features': self.features,
                        'is_trial': False,
                    },
                )

        self.stdout.write(self.style.SUCCESS(
            f'Seeded 22 ambulance admin accounts. New users: {created_users}, '
            f'new ambulances: {created_ambulances}. Password: {self.password}'
        ))
