from django.core.management.base import BaseCommand
from apps.edoctor.models import EDoctorProfile, ConsultationSlot, EDoctorConsultation
from datetime import datetime, timedelta, time
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seed E-Doctor service with sample data'

    def handle(self, *args, **kwargs):
        # Clear existing data
        EDoctorConsultation.objects.all().delete()
        ConsultationSlot.objects.all().delete()
        EDoctorProfile.objects.all().delete()

        # Create doctors
        doctors_data = [
            {
                'name': 'Dr. Md. Rahman',
                'specialization': 'general',
                'qualification': 'mbbs',
                'experience_years': 15,
                'registration_number': 'REG001',
                'email': 'rahman@example.com',
                'phone_number': '+880-1700-111111',
                'hospital_name': 'Central Medical Hospital',
                'consultation_address': 'Gulshan, Dhaka',
                'consultation_fee': Decimal('500.00'),
                'consultation_duration_minutes': 30,
                'languages_spoken': 'Bengali, English',
                'available_days': 'Monday, Tuesday, Wednesday, Thursday, Friday',
                'available_start_time': time(9, 0),
                'available_end_time': time(18, 0),
                'is_available': True,
                'is_verified': True,
                'rating': Decimal('4.9'),
                'review_count': 245,
                'bio': 'Senior General Practitioner with 15 years of experience in primary care and patient consultation.',
                'specialties': 'General Medicine, Health Consultation, Preventive Care'
            },
            {
                'name': 'Dr. Fariha Khan',
                'specialization': 'cardiology',
                'qualification': 'md',
                'experience_years': 12,
                'registration_number': 'REG002',
                'email': 'fariha@example.com',
                'phone_number': '+880-1800-222222',
                'hospital_name': 'Heartcare Center',
                'consultation_address': 'Banani, Dhaka',
                'consultation_fee': Decimal('800.00'),
                'consultation_duration_minutes': 45,
                'languages_spoken': 'Bengali, English, Urdu',
                'available_days': 'Monday, Wednesday, Friday, Saturday',
                'available_start_time': time(10, 0),
                'available_end_time': time(17, 0),
                'is_available': True,
                'is_verified': True,
                'rating': Decimal('4.8'),
                'review_count': 189,
                'bio': 'Experienced Cardiologist specializing in cardiac consultations and heart disease management.',
                'specialties': 'Cardiology, Hypertension Management, Cardiac Consultation'
            },
            {
                'name': 'Dr. Karim Hassan',
                'specialization': 'pediatrics',
                'qualification': 'md',
                'experience_years': 10,
                'registration_number': 'REG003',
                'email': 'karim@example.com',
                'phone_number': '+880-1900-333333',
                'hospital_name': 'Children Medical Center',
                'consultation_address': 'Dhanmondi, Dhaka',
                'consultation_fee': Decimal('600.00'),
                'consultation_duration_minutes': 35,
                'languages_spoken': 'Bengali, English',
                'available_days': 'Tuesday, Thursday, Saturday, Sunday',
                'available_start_time': time(14, 0),
                'available_end_time': time(19, 0),
                'is_available': True,
                'is_verified': True,
                'rating': Decimal('4.7'),
                'review_count': 167,
                'bio': 'Pediatric specialist with expertise in child health, vaccinations, and developmental care.',
                'specialties': 'Pediatrics, Child Health, Immunization'
            },
            {
                'name': 'Dr. Nasrin Akhter',
                'specialization': 'gynecology',
                'qualification': 'ms',
                'experience_years': 8,
                'registration_number': 'REG004',
                'email': 'nasrin@example.com',
                'phone_number': '+880-1700-444444',
                'hospital_name': 'Women Health Clinic',
                'consultation_address': 'Uttara, Dhaka',
                'consultation_fee': Decimal('700.00'),
                'consultation_duration_minutes': 40,
                'languages_spoken': 'Bengali, English',
                'available_days': 'Monday, Wednesday, Friday',
                'available_start_time': time(11, 0),
                'available_end_time': time(19, 0),
                'is_available': True,
                'is_verified': True,
                'rating': Decimal('4.9'),
                'review_count': 201,
                'bio': 'Experienced Gynecologist providing comprehensive women health care and consultations.',
                'specialties': 'Gynecology, Obstetrics, Women Health'
            },
            {
                'name': 'Dr. Arif Uzzaman',
                'specialization': 'orthopedics',
                'qualification': 'ms',
                'experience_years': 14,
                'registration_number': 'REG005',
                'email': 'arif@example.com',
                'phone_number': '+880-1600-555555',
                'hospital_name': 'Orthopedic Center',
                'consultation_address': 'Mirpur, Dhaka',
                'consultation_fee': Decimal('750.00'),
                'consultation_duration_minutes': 40,
                'languages_spoken': 'Bengali, English',
                'available_days': 'Tuesday, Thursday, Saturday',
                'available_start_time': time(9, 0),
                'available_end_time': time(17, 0),
                'is_available': True,
                'is_verified': False,
                'rating': Decimal('4.6'),
                'review_count': 143,
                'bio': 'Orthopedic specialist with expertise in bone, joint, and muscle disorders.',
                'specialties': 'Orthopedics, Sports Medicine, Joint Consultation'
            },
        ]

        created_doctors = []
        for doctor_data in doctors_data:
            doctor = EDoctorProfile.objects.create(**doctor_data)
            created_doctors.append(doctor)
            self.stdout.write(f"Created doctor: {doctor.name}")

        # Create consultation slots for each doctor
        base_date = datetime.now().date()
        for i, doctor in enumerate(created_doctors):
            for day_offset in range(5):
                slot_date = base_date + timedelta(days=day_offset)
                for hour in [9, 11, 14, 16]:
                    start_time = datetime.combine(slot_date, time(hour, 0))
                    end_time = start_time + timedelta(minutes=doctor.consultation_duration_minutes)
                    
                    ConsultationSlot.objects.create(
                        doctor=doctor,
                        start_time=start_time,
                        end_time=end_time,
                        status='available',
                        is_available=True
                    )

        self.stdout.write(self.style.SUCCESS(f'Created {len(created_doctors)} doctors and {ConsultationSlot.objects.count()} consultation slots'))

        # Create sample consultations
        consultation_count = 0
        for doctor in created_doctors[:3]:
            for i in range(2):
                consultation = EDoctorConsultation.objects.create(
                    doctor=doctor,
                    patient_name=f'Patient {i+1}',
                    patient_email=f'patient{i+1}@example.com',
                    patient_phone=f'+880-1700-{100000+i}',
                    patient_age=25 + i*5,
                    chief_complaint='General health checkup and consultation',
                    medical_history='No major medical history',
                    scheduled_date=base_date + timedelta(days=i+1),
                    scheduled_time=time(10 + i, 0),
                    urgency='routine',
                    status='scheduled',
                    fee_amount=doctor.consultation_fee,
                )
                consultation_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully created {consultation_count} consultations'))
        self.stdout.write(self.style.SUCCESS('E-Doctor service seeded successfully!'))
