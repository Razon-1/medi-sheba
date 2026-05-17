from django.core.management.base import BaseCommand
from apps.hospitals.models import Hospital


class Command(BaseCommand):
    help = 'Add image URLs to hospitals for display'

    def handle(self, *args, **kwargs):
        # Image URLs for different hospital types
        hospital_images = {
            'government': [
                'https://images.unsplash.com/photo-1587826080693-fd3891757a9a?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1631217314830-4655f809f84e?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1576091160649-112d4d3f1caf?w=400&h=300&fit=crop',
            ],
            'private': [
                'https://images.unsplash.com/photo-1519494026892-80bbd2d38fe1?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1631217314830-4655f809f84e?w=400&h=300&fit=crop',
            ],
            'clinic': [
                'https://images.unsplash.com/photo-1579154204601-01d430e9e118?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1631217314830-4655f809f84e?w=400&h=300&fit=crop',
            ],
        }

        updated_count = 0
        hospitals = Hospital.objects.all()
        
        for idx, hospital in enumerate(hospitals):
            if not hospital.image_url:
                # Select image based on hospital type
                images = hospital_images.get(hospital.type, hospital_images['private'])
                image_url = images[idx % len(images)]
                
                hospital.image_url = image_url
                hospital.save()
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Updated: {hospital.name}'))
        
        self.stdout.write(self.style.SUCCESS(f'\nTotal hospitals updated: {updated_count}'))
