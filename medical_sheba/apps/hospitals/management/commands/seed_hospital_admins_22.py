from datetime import time, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.doctors.models import Doctor
from apps.edoctor.models import ConsultationSlot, EDoctorProfile
from apps.hospitals.models import Hospital
from apps.payments.models import Payment, Subscription


User = get_user_model()


class Command(BaseCommand):
    help = 'Seed 22 hospital admin accounts with hospitals, doctors, e-doctors, and annual subscriptions'

    password = 'Razon@123'
    image_urls = [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ73To90SjMolcm6RXHyf7VwEzEXVDyDYRb6g&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRq2eTN6FawJASAmoj0GPNkFVVQRsvGz8pDUw&s',
    ]
    male_doctor_image_urls = [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXMWkcd7xjdqb2f1_BJS1IXHFdGvtTF2RDZA&s',
    ]
    female_doctor_image_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkhXx1Fs4baGztoCg4tH1Xo_43GiNvaHPIhw&s'
    female_doctor_names = {
        'Fariha', 'Nasrin', 'Nusrat', 'Sabrina', 'Hina', 'Maliha', 'Samira', 'Farzana',
        'Ishrat', 'Nabila', 'Tahmina', 'Jannatul', 'Rumana', 'Afroza', 'Sharmin', 'Lamia',
        'Sadia', 'Momena', 'Roksana', 'Kaniz', 'Tasnim', 'Nargis',
    }

    areas = [
        ('Gulshan', 'Gulshan Avenue, Dhaka', Decimal('23.81030000'), Decimal('90.41250000')),
        ('Banani', 'Road 11, Banani, Dhaka', Decimal('23.79370000'), Decimal('90.40660000')),
        ('Dhanmondi', 'Dhanmondi 27, Dhaka', Decimal('23.74610000'), Decimal('90.37420000')),
        ('Mirpur', 'Mirpur 10, Dhaka', Decimal('23.80670000'), Decimal('90.36860000')),
        ('Uttara', 'Sector 7, Uttara, Dhaka', Decimal('23.87590000'), Decimal('90.37950000')),
        ('Motijheel', 'Commercial Area, Motijheel, Dhaka', Decimal('23.73300000'), Decimal('90.41720000')),
        ('Badda', 'Pragati Sarani, Badda, Dhaka', Decimal('23.78060000'), Decimal('90.42660000')),
        ('Mohammadpur', 'Town Hall, Mohammadpur, Dhaka', Decimal('23.76580000'), Decimal('90.35890000')),
        ('Farmgate', 'Farmgate, Tejgaon, Dhaka', Decimal('23.75640000'), Decimal('90.38900000')),
        ('Wari', 'Rankin Street, Wari, Dhaka', Decimal('23.71150000'), Decimal('90.41770000')),
        ('Khilgaon', 'Khilgaon Chowdhury Para, Dhaka', Decimal('23.75090000'), Decimal('90.42480000')),
        ('Rampura', 'DIT Road, Rampura, Dhaka', Decimal('23.76100000'), Decimal('90.42170000')),
        ('Jatrabari', 'Jatrabari Medical Road, Dhaka', Decimal('23.71040000'), Decimal('90.43520000')),
        ('Lalbagh', 'Lalbagh Fort Road, Dhaka', Decimal('23.71890000'), Decimal('90.38810000')),
        ('Kawran Bazar', 'Kawran Bazar, Dhaka', Decimal('23.75160000'), Decimal('90.39370000')),
        ('Mohakhali', 'Wireless Gate, Mohakhali, Dhaka', Decimal('23.77890000'), Decimal('90.39780000')),
        ('Shyamoli', 'Ring Road, Shyamoli, Dhaka', Decimal('23.77480000'), Decimal('90.36570000')),
        ('Basabo', 'Central Basabo, Dhaka', Decimal('23.74060000'), Decimal('90.42920000')),
        ('Azimpur', 'Azimpur Road, Dhaka', Decimal('23.72800000'), Decimal('90.38540000')),
        ('Cantonment', 'Cantonment, Dhaka', Decimal('23.82970000'), Decimal('90.39380000')),
        ('Banasree', 'Block C, Banasree, Dhaka', Decimal('23.76320000'), Decimal('90.43160000')),
        ('Savar', 'Savar Bus Stand, Dhaka', Decimal('23.84790000'), Decimal('90.25770000')),
    ]

    doctor_names = [
        ('Ahmed', 'Rahman'), ('Fariha', 'Khan'), ('Karim', 'Hassan'), ('Nasrin', 'Akter'),
        ('Arif', 'Uzzaman'), ('Nusrat', 'Faria'), ('Saiful', 'Islam'), ('Sabrina', 'Khan'),
        ('Rana', 'Hassan'), ('Tarek', 'Ahmed'), ('Hina', 'Mahmud'), ('Imran', 'Khan'),
        ('Mahmud', 'Chowdhury'), ('Maliha', 'Sultana'), ('Rezaul', 'Karim'), ('Samira', 'Rahman'),
        ('Jahid', 'Hasan'), ('Farzana', 'Islam'), ('Tanvir', 'Hossain'), ('Ishrat', 'Jahan'),
        ('Sakib', 'Mahmud'), ('Nabila', 'Ahmed'), ('Masud', 'Alam'), ('Tahmina', 'Begum'),
        ('Rafiq', 'Uddin'), ('Jannatul', 'Ferdous'), ('Shahriar', 'Kabir'), ('Rumana', 'Nasreen'),
        ('Anwar', 'Hossain'), ('Afroza', 'Parvin'), ('Khaled', 'Mahmud'), ('Sharmin', 'Akhter'),
        ('Nayeem', 'Hasan'), ('Lamia', 'Rahman'), ('Moshiur', 'Rahman'), ('Sadia', 'Tasnim'),
        ('Ehsan', 'Khan'), ('Momena', 'Khatun'), ('Fahim', 'Ahmed'), ('Roksana', 'Yeasmin'),
        ('Bashir', 'Alam'), ('Kaniz', 'Fatema'), ('Adnan', 'Haque'), ('Tasnim', 'Ara'),
        ('Rakib', 'Hossain'), ('Nargis', 'Sultana'), ('Zahid', 'Iqbal'), ('Hasib', 'Mahmud'),
    ]
    specialties = [
        ('General Medicine', 'Family Medicine'),
        ('Cardiology', 'Heart Disease'),
        ('Pediatrics', 'Child Health'),
        ('Gynecology', 'Women Health'),
        ('Orthopedics', 'Bone and Joint Care'),
        ('Dermatology', 'Skin and Hair Care'),
        ('Neurology', 'Brain and Nerve Care'),
        ('Urology', 'Kidney and Urinary Care'),
        ('Ophthalmology', 'Eye Care'),
        ('Psychiatry', 'Mental Health'),
        ('ENT', 'Ear Nose Throat'),
        ('Dentistry', 'Oral Health'),
    ]
    edoctor_specializations = [
        'general', 'cardiology', 'pediatrics', 'gynecology', 'orthopedics', 'dermatology',
        'neurology', 'urology', 'ophthalmology', 'psychiatry', 'ent', 'dentistry',
    ]
    edoctor_qualifications = ['mbbs', 'md', 'md', 'ms', 'ms', 'md', 'md', 'ms', 'ms', 'md', 'mbbs', 'bds']

    features = {
        'consultations_per_month': 100,
        'max_appointments': 200,
        'priority_support': True,
        'admin_tools': True,
        'hospital_dashboard': True,
        'doctor_management': True,
        'edoctor_management': True,
    }

    def handle(self, *args, **options):
        created_users = 0
        created_hospitals = 0
        created_doctors = 0
        created_edoctors = 0
        created_slots = 0
        active_until = timezone.now() + timedelta(days=365)

        with transaction.atomic():
            for hospital_index in range(1, 23):
                email = f'hospital{hospital_index}@gmail.com'
                phone = f'+880191{hospital_index:08d}'
                area, address, latitude, longitude = self.areas[hospital_index - 1]

                admin_user, user_created = User.objects.update_or_create(
                    email=email,
                    defaults={
                        'phone': phone,
                        'first_name': 'Hospital',
                        'last_name': f'Admin {hospital_index}',
                        'roles': ['hospital_admin'],
                        'district': 'Dhaka',
                        'upazila': area,
                        'address': address,
                        'is_active': True,
                        'is_verified': True,
                        'has_made_first_payment': True,
                    },
                )
                admin_user.set_password(self.password)
                admin_user.save()
                created_users += int(user_created)

                hospital, hospital_created = Hospital.objects.update_or_create(
                    admin_user=admin_user,
                    defaults={
                        'name': f'Medi Sheba Hospital {hospital_index:02d}',
                        'type': ['private', 'clinic', 'government'][(hospital_index - 1) % 3],
                        'address': address,
                        'district': 'Dhaka',
                        'upazila': area,
                        'latitude': latitude,
                        'longitude': longitude,
                        'phone_primary': phone,
                        'phone_secondary': f'+880192{hospital_index:08d}',
                        'email': email,
                        'website': f'https://hospital{hospital_index}.medisheba.test',
                        'emergency_available': True,
                        'beds_total': 80 + hospital_index * 12,
                        'beds_available': 25 + hospital_index * 3,
                        'rating': Decimal('4.60') + Decimal((hospital_index % 4) * 8) / Decimal('100'),
                        'review_count': 120 + hospital_index * 9,
                        'image_url': self.image_urls[(hospital_index - 1) % len(self.image_urls)],
                        'doctor_image_url': self.male_doctor_image_urls[0],
                        'ambulance_image_url': self.image_urls[hospital_index % len(self.image_urls)],
                        'edoctor_image_url': self.male_doctor_image_urls[0],
                        'is_verified': True,
                        'is_active': True,
                        'description': (
                            f'Medi Sheba Hospital {hospital_index:02d} provides 24/7 healthcare, '
                            f'emergency support, outpatient care, diagnostics, and online consultations in {area}.'
                        ),
                        'services': 'Emergency, OPD, Diagnostics, Surgery, Pharmacy, ICU, Online Consultation',
                        'special_facilities': '24/7 Emergency, ICU, Ambulance Support, Digital Reports, Online Doctor Service',
                        'visiting_hours_start': time(8, 0),
                        'visiting_hours_end': time(21, 0),
                    },
                )
                created_hospitals += int(hospital_created)

                Doctor.objects.filter(
                    hospital=hospital,
                    bmdc_number__startswith=f'MS-H{hospital_index:02d}-',
                ).delete()
                EDoctorProfile.objects.filter(
                    hospital=hospital,
                    registration_number__startswith=f'MS-ED-H{hospital_index:02d}-',
                ).delete()

                for doctor_index in range(1, 13):
                    name_index = ((hospital_index - 1) * 7 + doctor_index - 1) % len(self.doctor_names)
                    specialty_index = ((hospital_index - 1) * 5 + doctor_index - 1) % len(self.specialties)
                    first_name, last_name = self.doctor_names[name_index]
                    specialty, subspecialty = self.specialties[specialty_index]
                    edoctor_specialization = self.edoctor_specializations[specialty_index]
                    edoctor_qualification = self.edoctor_qualifications[specialty_index]
                    doctor_image_url = (
                        self.female_doctor_image_url
                        if first_name in self.female_doctor_names
                        else self.male_doctor_image_urls[(doctor_index - 1) % len(self.male_doctor_image_urls)]
                    )
                    doctor_email = f'hospital{hospital_index}doctor{doctor_index}@gmail.com'
                    doctor_phone = f'+880193{hospital_index:02d}{doctor_index:06d}'
                    doctor_user, doctor_user_created = User.objects.update_or_create(
                        email=doctor_email,
                        defaults={
                            'phone': doctor_phone,
                            'first_name': first_name,
                            'last_name': last_name,
                            'roles': ['doctor'],
                            'district': 'Dhaka',
                            'upazila': area,
                            'address': address,
                            'is_active': True,
                            'is_verified': True,
                        },
                    )
                    doctor_user.set_password(self.password)
                    doctor_user.save()
                    created_users += int(doctor_user_created)

                    Doctor.objects.create(
                        user=doctor_user,
                        hospital=hospital,
                        bmdc_number=f'MS-H{hospital_index:02d}-D{doctor_index:03d}',
                        specialty=specialty,
                        subspecialty=subspecialty,
                        qualifications='MBBS, FCPS' if doctor_index % 3 else 'MBBS, MD',
                        experience_years=5 + ((hospital_index + doctor_index) % 16),
                        consultation_fee=Decimal('500.00') + Decimal((doctor_index % 6) * 100),
                        follow_up_fee=Decimal('300.00') + Decimal((doctor_index % 4) * 50),
                        chamber_address=f'{hospital.name}, {address}',
                        available_days='Saturday, Sunday, Monday, Tuesday, Wednesday',
                        available_time_start=time(9, 0),
                        available_time_end=time(17, 0),
                        bio=f'Dr. {first_name} {last_name} is an experienced {specialty} specialist at {hospital.name}.',
                        languages='Bengali, English',
                        rating=Decimal('4.50') + Decimal((doctor_index % 5) * 8) / Decimal('100'),
                        review_count=40 + hospital_index + doctor_index * 3,
                        is_verified=True,
                        is_available=True,
                        requires_authentication=False,
                        image_url=doctor_image_url,
                    )
                    created_doctors += 1

                    edoctor = EDoctorProfile.objects.create(
                        hospital=hospital,
                        name=f'{first_name} {last_name}',
                        specialization=edoctor_specialization,
                        qualification=edoctor_qualification,
                        experience_years=5 + ((hospital_index + doctor_index) % 16),
                        registration_number=f'MS-ED-H{hospital_index:02d}-D{doctor_index:03d}',
                        email=f'hospital{hospital_index}edoctor{doctor_index}@gmail.com',
                        phone_number=f'+880194{hospital_index:02d}{doctor_index:06d}',
                        hospital_name=hospital.name,
                        consultation_address=f'Online consultation from {hospital.name}, {area}, Dhaka',
                        consultation_fee=Decimal('450.00') + Decimal((doctor_index % 6) * 75),
                        consultation_duration_minutes=30 if doctor_index % 4 else 45,
                        languages_spoken='Bengali, English',
                        available_days='Saturday, Sunday, Monday, Tuesday, Wednesday',
                        available_start_time=time(10, 0),
                        available_end_time=time(20, 0),
                        availability_schedule=[
                            {'day': 'Saturday', 'start': '10:00', 'end': '14:00'},
                            {'day': 'Monday', 'start': '16:00', 'end': '20:00'},
                            {'day': 'Wednesday', 'start': '10:00', 'end': '14:00'},
                        ],
                        is_available=True,
                        requires_authentication=False,
                        is_verified=True,
                        rating=Decimal('4.55') + Decimal((doctor_index % 5) * 7) / Decimal('100'),
                        review_count=35 + hospital_index + doctor_index * 2,
                        bio=f'Online consultation provider for {specialty} patients from {hospital.name}.',
                        specialties=f'{specialty}, {subspecialty}, Online Consultation',
                        image_url=doctor_image_url,
                    )
                    created_edoctors += 1

                    base_date = timezone.localdate() + timedelta(days=1)
                    for day_offset in range(3):
                        start_time = timezone.make_aware(
                            timezone.datetime.combine(base_date + timedelta(days=day_offset), time(10 + day_offset * 2, 0))
                        )
                        ConsultationSlot.objects.create(
                            doctor=edoctor,
                            start_time=start_time,
                            end_time=start_time + timedelta(minutes=edoctor.consultation_duration_minutes),
                            is_available=True,
                            status='available',
                        )
                        created_slots += 1

                payment, _ = Payment.objects.update_or_create(
                    transaction_id=f'HOSP-ANNUAL-{hospital_index:02d}',
                    defaults={
                        'user': admin_user,
                        'hospital': hospital,
                        'amount': Decimal('3999.00'),
                        'currency': 'BDT',
                        'gateway': 'sslcommerz',
                        'payment_type': 'subscription',
                        'reference_type': 'hospital_subscription',
                        'reference_id': str(hospital.id),
                        'status': 'success',
                        'paid_at': timezone.now(),
                        'gateway_reference': f'SEED-HOSP-{hospital_index:02d}',
                    },
                )

                Subscription.objects.update_or_create(
                    user=admin_user,
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
            f'Seeded 22 hospital admin accounts. New users: {created_users}, '
            f'new hospitals: {created_hospitals}, doctors: {created_doctors}, '
            f'e-doctors: {created_edoctors}, slots: {created_slots}. Password: {self.password}'
        ))
