from django.core.management.base import BaseCommand
from apps.hospitals.models import Hospital
from apps.ambulance.models import AmbulanceService
from apps.emedicine.models import EMedicinePharmacy
from apps.edoctor.models import EDoctorProfile
from apps.doctors.models import Doctor


class Command(BaseCommand):
    help = 'Seed images for all services (25+ items for each)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('SEEDING IMAGES FOR ALL SERVICES'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        # Hospital images
        hospital_images = [
            'https://images.unsplash.com/photo-1587826080693-fd3891757a9a?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1631217314830-4655f809f84e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1576091160649-112d4d3f1caf?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1519494026892-80bbd2d38fe1?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1579154204601-01d430e9e118?w=400&h=300&fit=crop',
        ]
        
        # Doctor images
        doctor_images = [
            'https://images.unsplash.com/photo-1622307479241-21e88c9cb8d8?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1612349317150-e716f8a01751?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1594824476967-48c676c89a0f?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1559839734033-6461acca80dd?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1618498082410-b3570ba7ae0f?w=300&h=300&fit=crop',
        ]
        
        # Ambulance images
        ambulance_images = [
            'https://images.unsplash.com/photo-1586854692186-e5b8a9dbbd16?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1631217314830-4655f809f84e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1579154204601-01d430e9e118?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1587826080693-fd3891757a9a?w=400&h=300&fit=crop',
        ]
        
        # Pharmacy images
        pharmacy_images = [
            'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1587854692186-e5b8a9dbbd16?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1631217314830-4655f809f84e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1579154204601-01d430e9e118?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
        ]
        
        # E-Doctor images
        edoctor_images = [
            'https://images.unsplash.com/photo-1622307479241-21e88c9cb8d8?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1612349317150-e716f8a01751?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1594824476967-48c676c89a0f?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1559839734033-6461acca80dd?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1618498082410-b3570ba7ae0f?w=300&h=300&fit=crop',
        ]
        
        # Update Hospitals
        count = 0
        for idx, hospital in enumerate(Hospital.objects.all()):
            if not hospital.image_url:
                hospital.image_url = hospital_images[idx % len(hospital_images)]
                hospital.save()
                count += 1
        self.stdout.write(self.style.SUCCESS(f'✓ Hospitals: {count} updated with images'))
        
        # Update Doctors
        count = 0
        for idx, doctor in enumerate(Doctor.objects.all()):
            if not doctor.image_url:
                doctor.image_url = doctor_images[idx % len(doctor_images)]
                doctor.save()
                count += 1
        self.stdout.write(self.style.SUCCESS(f'✓ Doctors: {count} updated with images'))
        
        # Update Ambulances
        count = 0
        for idx, ambulance in enumerate(AmbulanceService.objects.all()):
            if not ambulance.image_url:
                ambulance.image_url = ambulance_images[idx % len(ambulance_images)]
                ambulance.save()
                count += 1
        self.stdout.write(self.style.SUCCESS(f'✓ Ambulances: {count} updated with images'))
        
        # Update Pharmacies
        count = 0
        for idx, pharmacy in enumerate(EMedicinePharmacy.objects.all()):
            if not pharmacy.image_url:
                pharmacy.image_url = pharmacy_images[idx % len(pharmacy_images)]
                pharmacy.save()
                count += 1
        self.stdout.write(self.style.SUCCESS(f'✓ Pharmacies: {count} updated with images'))
        
        # Update E-Doctors
        count = 0
        for idx, edoctor in enumerate(EDoctorProfile.objects.all()):
            if not edoctor.image_url:
                edoctor.image_url = edoctor_images[idx % len(edoctor_images)]
                edoctor.save()
                count += 1
        self.stdout.write(self.style.SUCCESS(f'✓ E-Doctors: {count} updated with images'))
        
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('All services now have images!'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
