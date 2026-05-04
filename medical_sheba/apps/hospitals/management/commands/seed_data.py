from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.users.models import User
from apps.hospitals.models import Hospital
from apps.doctors.models import Doctor
from apps.appointments.models import Appointment
from apps.blood.models import BloodDonor, BloodRequest
from apps.payments.models import Payment
from apps.notifications.models import Notification
from apps.search.models import Review
from datetime import datetime, timedelta
import random


class Command(BaseCommand):
    help = 'Seed database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting database seeding...')
        
        # Create sample users
        self.create_sample_users()
        self.create_sample_hospitals()
        self.create_sample_doctors()
        self.create_sample_appointments()
        self.create_sample_blood_data()
        self.create_sample_reviews()
        
        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))

    def create_sample_users(self):
        """Create sample user accounts"""
        users_data = [
            {
                'email': 'patient1@example.com',
                'phone': '+8801700000001',
                'first_name': 'Rajib',
                'last_name': 'Khan',
                'role': 'patient',
                'district': 'Dhaka',
                'password': 'password123'
            },
            {
                'email': 'patient2@example.com',
                'phone': '+8801700000002',
                'first_name': 'Fatima',
                'last_name': 'Ahmed',
                'role': 'patient',
                'district': 'Dhaka',
                'password': 'password123'
            },
            {
                'email': 'doctor1@example.com',
                'phone': '+8801700000011',
                'first_name': 'Ahmed',
                'last_name': 'Hasan',
                'role': 'doctor',
                'district': 'Dhaka',
                'password': 'password123'
            },
            {
                'email': 'doctor2@example.com',
                'phone': '+8801700000012',
                'first_name': 'Fatima',
                'last_name': 'Rahman',
                'role': 'doctor',
                'district': 'Dhaka',
                'password': 'password123'
            },
            {
                'email': 'doctor3@example.com',
                'phone': '+8801700000013',
                'first_name': 'Mohammad',
                'last_name': 'Karim',
                'role': 'doctor',
                'district': 'Dhaka',
                'password': 'password123'
            },
            {
                'email': 'doctor4@example.com',
                'phone': '+8801700000014',
                'first_name': 'Samina',
                'last_name': 'Begum',
                'role': 'doctor',
                'district': 'Dhaka',
                'password': 'password123'
            },
            {
                'email': 'donor1@example.com',
                'phone': '+8801700000021',
                'first_name': 'Rajesh',
                'last_name': 'Kumar',
                'role': 'donor',
                'district': 'Dhaka',
                'blood_group': 'O+',
                'password': 'password123'
            },
            {
                'email': 'donor2@example.com',
                'phone': '+8801700000022',
                'first_name': 'Hafiza',
                'last_name': 'Aisha',
                'role': 'donor',
                'district': 'Dhaka',
                'blood_group': 'B+',
                'password': 'password123'
            },
        ]
        
        for user_data in users_data:
            if not User.objects.filter(email=user_data['email']).exists():
                password = user_data.pop('password')
                user = User.objects.create_user(**user_data)
                user.set_password(password)
                user.save()
                self.stdout.write(f'Created user: {user_data["email"]}')
            else:
                self.stdout.write(f'User already exists: {user_data["email"]}')

    def create_sample_hospitals(self):
        """Create sample hospitals"""
        hospitals_data = [
            {
                'name': 'Apollo Hospital',
                'type': 'private',
                'address': 'Gulshan, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Gulshan',
                'latitude': 23.8103,
                'longitude': 90.4125,
                'phone_primary': '+880-2-9881188',
                'phone_secondary': '+880-2-9881189',
                'email': 'apollo@hospital.com',
                'website': 'https://apollo.com.bd',
                'emergency_available': True,
                'beds_total': 500,
                'beds_available': 450,
                'rating': 4.8,
                'review_count': 1250,
                'is_verified': True,
            },
            {
                'name': 'Square Hospital',
                'type': 'private',
                'address': 'Panthapath, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Dhanmondi',
                'latitude': 23.7395,
                'longitude': 90.3664,
                'phone_primary': '+880-2-8633333',
                'phone_secondary': '+880-2-8633334',
                'email': 'square@hospital.com',
                'website': 'https://square.com.bd',
                'emergency_available': True,
                'beds_total': 350,
                'beds_available': 320,
                'rating': 4.7,
                'review_count': 980,
                'is_verified': True,
            },
            {
                'name': 'National Hospital',
                'type': 'government',
                'address': 'Mirpur, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Mirpur',
                'latitude': 23.8145,
                'longitude': 90.3570,
                'phone_primary': '+880-2-9001001',
                'phone_secondary': '+880-2-9001002',
                'email': 'national@hospital.com',
                'website': 'https://national.gov.bd',
                'emergency_available': True,
                'beds_total': 600,
                'beds_available': 550,
                'rating': 4.5,
                'review_count': 1500,
                'is_verified': True,
            },
            {
                'name': 'Labaid Hospital',
                'type': 'private',
                'address': 'Dhanmondi, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Dhanmondi',
                'latitude': 23.7462,
                'longitude': 90.3664,
                'phone_primary': '+880-2-8148999',
                'phone_secondary': '+880-2-8148998',
                'email': 'labaid@hospital.com',
                'website': 'https://labaid.com.bd',
                'emergency_available': True,
                'beds_total': 450,
                'beds_available': 400,
                'rating': 4.6,
                'review_count': 1100,
                'is_verified': True,
            },
            {
                'name': 'Evercare Hospital',
                'type': 'private',
                'address': 'Bashundhara, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Bashundhara',
                'latitude': 23.8506,
                'longitude': 90.4289,
                'phone_primary': '+880-2-8883939',
                'phone_secondary': '+880-2-8883940',
                'email': 'evercare@hospital.com',
                'website': 'https://evercare.com.bd',
                'emergency_available': True,
                'beds_total': 300,
                'beds_available': 280,
                'rating': 4.7,
                'review_count': 950,
                'is_verified': True,
            },
            {
                'name': 'Ibn Sina Hospital',
                'type': 'private',
                'address': 'Kawran Bazar, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Kawran Bazar',
                'latitude': 23.7686,
                'longitude': 90.3576,
                'phone_primary': '+880-2-9611050',
                'phone_secondary': '+880-2-9611051',
                'email': 'ibnsina@hospital.com',
                'website': 'https://ibnsina.com.bd',
                'emergency_available': True,
                'beds_total': 380,
                'beds_available': 350,
                'rating': 4.6,
                'review_count': 850,
                'is_verified': True,
            },
        ]
        
        for hosp_data in hospitals_data:
            if not Hospital.objects.filter(name=hosp_data['name']).exists():
                Hospital.objects.create(**hosp_data)
                self.stdout.write(f'Created hospital: {hosp_data["name"]}')

    def create_sample_doctors(self):
        """Create sample doctors"""
        specialties = [
            'Cardiology', 'Gynecology', 'Orthopedics', 'Neurology',
            'Dermatology', 'Pediatrics', 'Neurosurgery', 'Oncology'
        ]
        
        doctor_users = User.objects.filter(role='doctor')
        hospitals = Hospital.objects.all()
        
        doctor_data_list = [
            ('Ahmed', 'Hasan', 'Cardiology', 12),
            ('Fatima', 'Rahman', 'Gynecology', 10),
            ('Mohammad', 'Karim', 'Orthopedics', 15),
            ('Samina', 'Begum', 'Neurology', 8),
        ]
        
        for user in doctor_users:
            if not Doctor.objects.filter(user=user).exists():
                hospital = hospitals.first() if hospitals.exists() else None
                doctor = Doctor.objects.create(
                    user=user,
                    hospital=hospital,
                    bmdc_number=f'BMDC{user.id:05d}',
                    specialty=random.choice(specialties),
                    qualifications='MBBS, MD',
                    experience_years=random.randint(5, 20),
                    consultation_fee=500 + random.randint(0, 500),
                    follow_up_fee=300 + random.randint(0, 300),
                    rating=round(random.uniform(4.5, 5.0), 1),
                    review_count=random.randint(50, 500),
                    is_verified=True,
                    is_available=True,
                )
                self.stdout.write(f'Created doctor: {user.first_name} {user.last_name}')

    def create_sample_appointments(self):
        """Create sample appointments"""
        patients = User.objects.filter(role='patient')
        doctors = Doctor.objects.all()
        hospitals = Hospital.objects.all()
        
        if not patients.exists() or not doctors.exists():
            return
        
        statuses = ['pending', 'confirmed', 'completed', 'cancelled']
        payment_statuses = ['unpaid', 'paid', 'refunded']
        
        for i in range(15):
            if not Appointment.objects.filter(appointment_no=f'APT{i:05d}').exists():
                doctor = random.choice(doctors)
                appointment = Appointment.objects.create(
                    appointment_no=f'APT{i:05d}',
                    patient=random.choice(patients),
                    doctor=doctor,
                    hospital=random.choice(hospitals),
                    appointment_date=timezone.now().date() + timedelta(days=random.randint(1, 30)),
                    appointment_time='10:00',
                    type=random.choice(['new', 'follow_up']),
                    status=random.choice(statuses),
                    payment_status=random.choice(payment_statuses),
                    fee_amount=doctor.consultation_fee,
                )
                self.stdout.write(f'Created appointment: {appointment.appointment_no}')

    def create_sample_blood_data(self):
        """Create sample blood donor and request data"""
        donors = User.objects.filter(role='donor')
        blood_groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
        
        for donor in donors:
            if not BloodDonor.objects.filter(user=donor).exists():
                BloodDonor.objects.create(
                    user=donor,
                    blood_group=donor.blood_group or random.choice(blood_groups),
                    district=donor.district or 'Dhaka',
                    is_available=True,
                    total_donations=random.randint(1, 10),
                )
                self.stdout.write(f'Created blood donor: {donor.first_name}')
        
        # Create blood requests
        hospitals = Hospital.objects.all()
        patients = User.objects.filter(role='patient')
        
        for i in range(10):
            if not BloodRequest.objects.filter(id=i+1).exists():
                BloodRequest.objects.create(
                    requester=random.choice(patients) if patients.exists() else donors.first(),
                    blood_group=random.choice(blood_groups),
                    units_required=random.randint(1, 5),
                    urgency=random.choice(['normal', 'urgent', 'critical']),
                    patient_name=f'Patient {i+1}',
                    contact_phone=f'+8801700{10000+i}',
                    required_date=timezone.now().date() + timedelta(days=random.randint(1, 7)),
                    hospital=random.choice(hospitals) if hospitals.exists() else None,
                    district='Dhaka',
                    status='open',
                )
                self.stdout.write(f'Created blood request for {blood_groups[i % len(blood_groups)]}')

    def create_sample_reviews(self):
        """Create sample reviews"""
        doctors = Doctor.objects.all()
        appointments = Appointment.objects.filter(status='completed')
        
        if appointments.exists():
            for appointment in appointments[:5]:
                if not Review.objects.filter(
                    reviewer=appointment.patient,
                    target_type='doctor',
                    target_id=appointment.doctor.id
                ).exists():
                    Review.objects.create(
                        reviewer=appointment.patient,
                        target_type='doctor',
                        target_id=appointment.doctor.id,
                        rating=random.randint(4, 5),
                        comment='Excellent service and professional doctor.',
                        appointment=appointment,
                        is_visible=True,
                    )
                    self.stdout.write(f'Created review for doctor')
