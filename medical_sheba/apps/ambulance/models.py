from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.location.models import District, Upazila


class AmbulanceService(models.Model):
    VEHICLE_TYPE_CHOICES = [
        ('basic', 'Basic Ambulance'),
        ('advanced', 'Advanced Life Support'),
        ('icu', 'ICU Ambulance'),
    ]

    name = models.CharField(max_length=200)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES)
    driver_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    
    # Location information
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True)
    upazila = models.ForeignKey(Upazila, on_delete=models.SET_NULL, null=True, blank=True)
    address = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Service information
    cost_per_km = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    is_available = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    # Ratings
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0, 
                                 validators=[MinValueValidator(0), MaxValueValidator(5)])
    review_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_verified', '-rating']
        indexes = [
            models.Index(fields=['district', 'is_available']),
            models.Index(fields=['vehicle_type', 'is_available']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.get_vehicle_type_display()}"


class AmbulanceRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('on_the_way', 'On The Way'),
        ('arrived', 'Arrived'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    URGENCY_CHOICES = [
        ('normal', 'Normal'),
        ('urgent', 'Urgent'),
        ('critical', 'Critical'),
    ]
    
    VEHICLE_TYPE_CHOICES = [
        ('basic', 'Basic Ambulance'),
        ('advanced', 'Advanced Life Support'),
        ('icu', 'ICU Ambulance'),
    ]

    # Request information
    request_id = models.CharField(max_length=50, unique=True, editable=False)
    patient_name = models.CharField(max_length=200)
    contact_phone = models.CharField(max_length=20)
    
    # Location information
    pickup_location = models.CharField(max_length=300, help_text="Pickup location name")
    pickup_address = models.TextField()
    dropoff_location = models.CharField(max_length=300, help_text="Dropoff location name")
    
    # Service details
    vehicle_type_required = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='normal')
    required_date = models.DateTimeField()
    notes = models.TextField(blank=True)
    
    # Assignment
    ambulance = models.ForeignKey(AmbulanceService, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'required_date']),
            models.Index(fields=['vehicle_type_required', 'status']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.request_id:
            from datetime import datetime
            import random
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            random_suffix = f"{random.randint(1000, 9999)}"
            self.request_id = f"AMB{timestamp}{random_suffix}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.request_id} - {self.patient_name}"
