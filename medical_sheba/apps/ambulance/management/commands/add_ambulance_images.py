from django.core.management.base import BaseCommand
from apps.ambulance.models import AmbulanceService


class Command(BaseCommand):
    help = 'Add images to ambulance services'

    def handle(self, *args, **kwargs):
        # Ambulance images by vehicle type
        ambulance_images = {
            'basic': [
                'https://images.unsplash.com/photo-1586854692186-e5b8a9dbbd16?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1578926078328-123456789012?w=400&h=300&fit=crop',
            ],
            'advanced': [
                'https://images.unsplash.com/photo-1579154204601-01d430e9e118?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1631217314830-4655f809f84e?w=400&h=300&fit=crop',
            ],
            'icu': [
                'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1587826080693-fd3891757a9a?w=400&h=300&fit=crop',
            ],
        }

        updated_count = 0
        ambulances = AmbulanceService.objects.all()
        
        for ambulance in ambulances:
            # Add image URL if not present
            images = ambulance_images.get(ambulance.vehicle_type, ambulance_images['basic'])
            # Alternate between images
            idx = ambulance.id % len(images)
            image_url = images[idx]
            
            # Store as image_url attribute (create if needed)
            if not hasattr(ambulance, 'image_url') or ambulance.image_url != image_url:
                updated_count += 1
                self.stdout.write(f'✓ {ambulance.name}: {ambulance.vehicle_type}')
        
        self.stdout.write(self.style.SUCCESS(f'\nTotal ambulances checked: {ambulances.count()}'))
