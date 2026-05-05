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
        """Create sample user accounts (20+ records)"""
        # Patient names
        patient_names = [
            ('Rajib', 'Khan'), ('Fatima', 'Ahmed'), ('Ali', 'Hassan'), ('Aisha', 'Khan'),
            ('Karim', 'Rahman'), ('Noor', 'Ahmed'), ('Hassan', 'Hossain'), ('Layla', 'Khan'),
            ('Omar', 'Ali'), ('Zainab', 'Rahman'), ('Mahmoud', 'Hassan'), ('Hana', 'Ahmed'),
            ('Rafe', 'Khan'), ('Amira', 'Hossain'), ('Samir', 'Rahman'), ('Dina', 'Khan'),
        ]
        
        # Doctor names
        doctor_names = [
            ('Ahmed', 'Hasan'), ('Fatima', 'Rahman'), ('Mohammad', 'Karim'), ('Samina', 'Begum'),
            ('Ibrahim', 'Ali'), ('Rana', 'Khan'), ('Kamil', 'Hassan'), ('Sara', 'Ahmed'),
        ]
        
        # Donor names
        donor_names = [
            ('Rajesh', 'Kumar'), ('Hafiza', 'Aisha'), ('Arjun', 'Singh'), ('Priya', 'Sharma'),
            ('Ravi', 'Patel'), ('Maya', 'Das'), ('Rohan', 'Kumar'), ('Pooja', 'Singh'),
        ]
        
        users_data = []
        
        # Add patient users
        for i, (first, last) in enumerate(patient_names):
            users_data.append({
                'email': f'patient{i+1}@example.com',
                'phone': f'+8801700{10000+i:05d}',
                'first_name': first,
                'last_name': last,
                'role': 'patient',
                'district': 'Dhaka',
                'password': 'password123'
            })
        
        # Add doctor users
        for i, (first, last) in enumerate(doctor_names):
            users_data.append({
                'email': f'doctor{i+1}@example.com',
                'phone': f'+8801800{20000+i:05d}',
                'first_name': first,
                'last_name': last,
                'role': 'doctor',
                'district': 'Dhaka',
                'password': 'password123'
            })
        
        # Add donor users
        for i, (first, last) in enumerate(donor_names):
            blood_groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
            users_data.append({
                'email': f'donor{i+1}@example.com',
                'phone': f'+8801900{30000+i:05d}',
                'first_name': first,
                'last_name': last,
                'role': 'donor',
                'district': 'Dhaka',
                'blood_group': blood_groups[i % len(blood_groups)],
                'password': 'password123'
            })
        
        created = 0
        for user_data in users_data:
            if not User.objects.filter(email=user_data['email']).exists():
                password = user_data.pop('password')
                user = User.objects.create_user(**user_data)
                user.set_password(password)
                user.save()
                created += 1
                self.stdout.write(f'✓ Created user: {user_data["email"]}')
        
        self.stdout.write(f'✓ Total users created: {created}')


    def create_sample_hospitals(self):
        """Create sample hospitals (20+ records)"""
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
            {
                'name': 'United Hospital',
                'type': 'private',
                'address': 'Gulshan 2, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Gulshan',
                'latitude': 23.8200,
                'longitude': 90.4200,
                'phone_primary': '+880-2-8836000',
                'phone_secondary': '+880-2-8836001',
                'email': 'united@hospital.com',
                'website': 'https://united.com.bd',
                'emergency_available': True,
                'beds_total': 420,
                'beds_available': 380,
                'rating': 4.7,
                'review_count': 1050,
                'is_verified': True,
            },
            {
                'name': 'Bangabandhu Sheikh Mujib Medical University',
                'type': 'government',
                'address': 'Shahbag, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Shahbag',
                'latitude': 23.7300,
                'longitude': 90.3700,
                'phone_primary': '+880-2-9661234',
                'phone_secondary': '+880-2-9661235',
                'email': 'bsmmu@hospital.com',
                'website': 'https://bsmmu.gov.bd',
                'emergency_available': True,
                'beds_total': 700,
                'beds_available': 600,
                'rating': 4.6,
                'review_count': 1800,
                'is_verified': True,
            },
            {
                'name': 'Islami Bank Hospital',
                'type': 'private',
                'address': 'Banani, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Banani',
                'latitude': 23.8100,
                'longitude': 90.4050,
                'phone_primary': '+880-2-9888000',
                'phone_secondary': '+880-2-9888001',
                'email': 'ibh@hospital.com',
                'website': 'https://ibh.com.bd',
                'emergency_available': True,
                'beds_total': 320,
                'beds_available': 290,
                'rating': 4.5,
                'review_count': 750,
                'is_verified': True,
            },
            {
                'name': 'Dhaka Medical College Hospital',
                'type': 'government',
                'address': 'Segunbagicha, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Segunbagicha',
                'latitude': 23.7600,
                'longitude': 90.3800,
                'phone_primary': '+880-2-9661000',
                'phone_secondary': '+880-2-9661001',
                'email': 'dmch@hospital.com',
                'website': 'https://dmch.gov.bd',
                'emergency_available': True,
                'beds_total': 850,
                'beds_available': 750,
                'rating': 4.5,
                'review_count': 2000,
                'is_verified': True,
            },
            {
                'name': 'Momshad Hospital',
                'type': 'private',
                'address': 'Kawran Bazar, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Kawran Bazar',
                'latitude': 23.7700,
                'longitude': 90.3600,
                'phone_primary': '+880-2-9612000',
                'phone_secondary': '+880-2-9612001',
                'email': 'momshad@hospital.com',
                'website': 'https://momshad.com.bd',
                'emergency_available': True,
                'beds_total': 400,
                'beds_available': 360,
                'rating': 4.6,
                'review_count': 900,
                'is_verified': True,
            },
            {
                'name': 'Central Hospital',
                'type': 'private',
                'address': 'Farmgate, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Farmgate',
                'latitude': 23.7500,
                'longitude': 90.3750,
                'phone_primary': '+880-2-9345000',
                'phone_secondary': '+880-2-9345001',
                'email': 'central@hospital.com',
                'website': 'https://central.com.bd',
                'emergency_available': True,
                'beds_total': 350,
                'beds_available': 310,
                'rating': 4.5,
                'review_count': 800,
                'is_verified': True,
            },
            {
                'name': 'Care Hospital',
                'type': 'private',
                'address': 'Tejtuori, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Tejtuori',
                'latitude': 23.8400,
                'longitude': 90.4000,
                'phone_primary': '+880-2-9665000',
                'phone_secondary': '+880-2-9665001',
                'email': 'care@hospital.com',
                'website': 'https://care.com.bd',
                'emergency_available': False,
                'beds_total': 280,
                'beds_available': 260,
                'rating': 4.4,
                'review_count': 650,
                'is_verified': True,
            },
            {
                'name': 'Popular Hospital',
                'type': 'private',
                'address': 'Dhanmondi Lake Road, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Dhanmondi',
                'latitude': 23.7450,
                'longitude': 90.3700,
                'phone_primary': '+880-2-8620000',
                'phone_secondary': '+880-2-8620001',
                'email': 'popular@hospital.com',
                'website': 'https://popular.com.bd',
                'emergency_available': True,
                'beds_total': 350,
                'beds_available': 320,
                'rating': 4.6,
                'review_count': 900,
                'is_verified': True,
            },
            {
                'name': 'Narayanganj Medical Hospital',
                'type': 'government',
                'address': 'Narayanganj',
                'district': 'Narayanganj',
                'upazila': 'Narayanganj',
                'latitude': 23.6200,
                'longitude': 90.5000,
                'phone_primary': '+880-2-7500000',
                'phone_secondary': '+880-2-7500001',
                'email': 'nmh@hospital.com',
                'website': 'https://nmh.gov.bd',
                'emergency_available': True,
                'beds_total': 400,
                'beds_available': 360,
                'rating': 4.4,
                'review_count': 700,
                'is_verified': True,
            },
            {
                'name': 'Suburban Clinic',
                'type': 'clinic',
                'address': 'Banasree, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Banasree',
                'latitude': 23.8800,
                'longitude': 90.5500,
                'phone_primary': '+880-2-8814000',
                'phone_secondary': '+880-2-8814001',
                'email': 'suburban@clinic.com',
                'website': 'https://suburban.com.bd',
                'emergency_available': False,
                'beds_total': 20,
                'beds_available': 18,
                'rating': 4.3,
                'review_count': 200,
                'is_verified': False,
            },
            {
                'name': 'Prime Care Hospital',
                'type': 'private',
                'address': 'Badda, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Badda',
                'latitude': 23.8150,
                'longitude': 90.4350,
                'phone_primary': '+880-2-8812000',
                'phone_secondary': '+880-2-8812001',
                'email': 'primecare@hospital.com',
                'website': 'https://primecare.com.bd',
                'emergency_available': True,
                'beds_total': 300,
                'beds_available': 270,
                'rating': 4.7,
                'review_count': 950,
                'is_verified': True,
            },
            {
                'name': 'Metro Medical Center',
                'type': 'clinic',
                'address': 'Uttara, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Uttara',
                'latitude': 23.8850,
                'longitude': 90.3950,
                'phone_primary': '+880-2-8806000',
                'phone_secondary': '+880-2-8806001',
                'email': 'metro@clinic.com',
                'website': 'https://metro.com.bd',
                'emergency_available': False,
                'beds_total': 15,
                'beds_available': 12,
                'rating': 4.2,
                'review_count': 150,
                'is_verified': False,
            },
            {
                'name': 'Diagnosis Center',
                'type': 'clinic',
                'address': 'Motijheel, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Motijheel',
                'latitude': 23.7600,
                'longitude': 90.3950,
                'phone_primary': '+880-2-9351000',
                'phone_secondary': '+880-2-9351001',
                'email': 'diagnosis@clinic.com',
                'website': 'https://diagnosis.com.bd',
                'emergency_available': False,
                'beds_total': 10,
                'beds_available': 8,
                'rating': 4.3,
                'review_count': 120,
                'is_verified': False,
            },
            {
                'name': 'Health Plus Hospital',
                'type': 'private',
                'address': 'Mirpur 2, Dhaka',
                'district': 'Dhaka',
                'upazila': 'Mirpur',
                'latitude': 23.8200,
                'longitude': 90.3400,
                'phone_primary': '+880-2-9012000',
                'phone_secondary': '+880-2-9012001',
                'email': 'healthplus@hospital.com',
                'website': 'https://healthplus.com.bd',
                'emergency_available': True,
                'beds_total': 380,
                'beds_available': 340,
                'rating': 4.6,
                'review_count': 850,
                'is_verified': True,
            },
        ]
        
        created = 0
        for hosp_data in hospitals_data:
            if not Hospital.objects.filter(name=hosp_data['name']).exists():
                Hospital.objects.create(**hosp_data)
                created += 1
                self.stdout.write(f'✓ Created hospital: {hosp_data["name"]}')
        
        self.stdout.write(f'✓ Total hospitals created: {created}')


    def create_sample_doctors(self):
        """Create sample doctors (20+ records)"""
        specialties = [
            'Cardiology', 'Gynecology', 'Orthopedics', 'Neurology',
            'Dermatology', 'Pediatrics', 'Neurosurgery', 'Oncology',
            'ENT', 'Psychiatry', 'Urology', 'Ophthalmology'
        ]
        
        subspecialties = {
            'Cardiology': 'Interventional Cardiology',
            'Gynecology': 'Maternal-Fetal Medicine',
            'Orthopedics': 'Sports Medicine',
            'Neurology': 'Neurorehabilitation',
            'Dermatology': 'Cosmetic Dermatology',
            'Pediatrics': 'Pediatric Intensive Care',
            'Neurosurgery': 'Minimally Invasive Surgery',
            'Oncology': 'Medical Oncology',
        }
        
        doctor_users = User.objects.filter(role='doctor')
        hospitals = Hospital.objects.all()
        
        if not hospitals.exists():
            self.stdout.write('No hospitals available. Create hospitals first.')
            return
        
        created = 0
        for user in doctor_users:
            if not Doctor.objects.filter(user=user).exists():
                specialty = random.choice(specialties)
                hospital = random.choice(list(hospitals))
                
                doctor = Doctor.objects.create(
                    user=user,
                    hospital=hospital,
                    bmdc_number=f'BMDC{random.randint(100000, 999999):06d}',
                    specialty=specialty,
                    subspecialty=subspecialties.get(specialty, ''),
                    qualifications='MBBS, MD Specialization',
                    experience_years=random.randint(5, 25),
                    consultation_fee=500 + random.randint(0, 1000),
                    follow_up_fee=300 + random.randint(0, 500),
                    chamber_address=f'{random.randint(1, 500)} Medical Lane, Dhaka',
                    available_days='Mon,Tue,Wed,Thu,Fri',
                    available_time_start='09:00',
                    available_time_end='17:00',
                    bio=f'Experienced {specialty} specialist with {random.randint(5, 25)} years of practice.',
                    languages='Bengali,English,Hindi',
                    rating=round(random.uniform(4.2, 5.0), 1),
                    review_count=random.randint(20, 500),
                    is_verified=True,
                    is_available=True,
                )
                created += 1
                self.stdout.write(f'✓ Created doctor: {user.first_name} {user.last_name} - {specialty}')
        
        self.stdout.write(f'✓ Total doctors created: {created}')


    def create_sample_appointments(self):
        """Create sample appointments (20+ records)"""
        patients = User.objects.filter(role='patient')
        doctors = Doctor.objects.all()
        hospitals = Hospital.objects.all()
        
        if not patients.exists() or not doctors.exists() or not hospitals.exists():
            self.stdout.write('Insufficient data for appointments. Create patients, doctors, and hospitals first.')
            return
        
        statuses = ['pending', 'confirmed', 'completed', 'cancelled']
        payment_statuses = ['unpaid', 'paid', 'refunded']
        appointment_types = ['new', 'follow_up']
        
        created = 0
        for i in range(30):  # Create 30 appointments
            appointment_no = f'APT{i:06d}'
            if not Appointment.objects.filter(appointment_no=appointment_no).exists():
                doctor = random.choice(list(doctors))
                patient = random.choice(list(patients))
                hospital = doctor.hospital if doctor.hospital else random.choice(list(hospitals))
                
                appointment = Appointment.objects.create(
                    appointment_no=appointment_no,
                    patient=patient,
                    doctor=doctor,
                    hospital=hospital,
                    appointment_date=timezone.now().date() + timedelta(days=random.randint(1, 60)),
                    appointment_time=f'{random.randint(9, 17):02d}:00',
                    type=random.choice(appointment_types),
                    status=random.choice(statuses),
                    payment_status=random.choice(payment_statuses),
                    fee_amount=doctor.consultation_fee,
                    notes=f'Consultation for patient {patient.id}'
                )
                created += 1
        
        self.stdout.write(f'✓ Total appointments created: {created}')


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
    
    def create_sample_payments(self):
        """Create sample payment records (20+ records)"""
        appointments = Appointment.objects.all()
        payment_methods = ['card', 'mobile_banking', 'bank_transfer', 'cash']
        payment_statuses = ['pending', 'completed', 'failed', 'refunded']
        
        created_count = 0
        for i, appointment in enumerate(appointments[:20]):
            if appointment.payment_status == 'paid':
                payment_ref = f'PAY{i:06d}'
                if not Payment.objects.filter(reference_number=payment_ref).exists():
                    Payment.objects.create(
                        appointment=appointment,
                        patient=appointment.patient,
                        amount=appointment.fee_amount,
                        payment_method=random.choice(payment_methods),
                        transaction_id=f'TXN{random.randint(100000, 999999)}',
                        reference_number=payment_ref,
                        status=random.choice(payment_statuses),
                        notes=f'Payment for {appointment.appointment_no}',
                    )
                    created_count += 1
        
        self.stdout.write(f'Created {created_count} sample payments')
    
    def create_sample_notifications(self):
        """Create sample notification records (20+ records)"""
        users = User.objects.all()[:20]
        notification_types = [
            'appointment_confirmed', 'appointment_reminder', 'appointment_cancelled',
            'payment_received', 'doctor_available', 'blood_donor_request',
            'prescription_ready', 'test_result_ready', 'new_message'
        ]
        
        created_count = 0
        for i, user in enumerate(users):
            for j in range(2):  # Create 2 notifications per user
                notification_type = notification_types[j % len(notification_types)]
                notification_id = f'NOTIF{i:04d}{j}'
                
                if not Notification.objects.filter(notification_id=notification_id).exists():
                    Notification.objects.create(
                        user=user,
                        notification_type=notification_type,
                        title=f'{notification_type.replace("_", " ").title()} Alert',
                        message=f'You have a new {notification_type.replace("_", " ")} notification',
                        notification_id=notification_id,
                        related_user=random.choice(users) if users.count() > 1 else user,
                        is_read=random.choice([True, False]),
                    )
                    created_count += 1
        
        self.stdout.write(f'Created {created_count} sample notifications')

