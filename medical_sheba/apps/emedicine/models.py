from django.db import models
from apps.location.models import District, Upazila
from django.contrib.auth import get_user_model
import random
import time

User = get_user_model()


class EMedicinePharmacy(models.Model):
    """Online pharmacy providing e-medicine services"""
    
    PHARMACY_CHOICES = [
        ('chain', 'Chain Pharmacy'),
        ('independent', 'Independent Pharmacy'),
        ('hospital', 'Hospital Pharmacy'),
    ]
    
    admin_user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='pharmacy_admin', null=True, blank=True)
    name = models.CharField(max_length=200)
    pharmacy_type = models.CharField(max_length=20, choices=PHARMACY_CHOICES, default='independent')
    license_number = models.CharField(max_length=100, unique=True)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True)
    upazila = models.ForeignKey(Upazila, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Location coordinates
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Service info
    delivery_time_hours = models.IntegerField(default=24)  # Delivery time in hours
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=100)  # Minimum order in BDT
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=50)
    
    # Verification and availability
    is_available = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    # Ratings
    rating = models.FloatField(default=4.5, help_text="Rating from 0 to 5")
    review_count = models.IntegerField(default=0)
    
    # Image
    image_url = models.CharField(max_length=500, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_verified', '-rating']
        indexes = [
            models.Index(fields=['is_available', 'is_verified']),
            models.Index(fields=['district', 'is_available']),
        ]
    
    def __str__(self):
        return self.name


class MedicineItem(models.Model):
    """Individual medicines/drugs available"""
    
    STRENGTH_UNIT_CHOICES = [
        ('mg', 'Milligrams'),
        ('mcg', 'Micrograms'),
        ('g', 'Grams'),
        ('ml', 'Milliliters'),
        ('iu', 'International Units'),
    ]
    
    MEDICINE_TYPE_CHOICES = [
        ('tablet', 'Tablet'),
        ('capsule', 'Capsule'),
        ('liquid', 'Liquid'),
        ('injection', 'Injection'),
        ('cream', 'Cream/Ointment'),
        ('syrup', 'Syrup'),
        ('powder', 'Powder'),
    ]
    
    pharmacy = models.ForeignKey(EMedicinePharmacy, on_delete=models.CASCADE, related_name='medicines')
    name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200, help_text="Generic/Scientific name")
    manufacturer = models.CharField(max_length=200)
    medicine_type = models.CharField(max_length=20, choices=MEDICINE_TYPE_CHOICES, default='tablet')
    
    strength = models.CharField(max_length=100, help_text="e.g., 500, 1000")
    strength_unit = models.CharField(max_length=10, choices=STRENGTH_UNIT_CHOICES, default='mg')
    
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price in BDT
    description = models.TextField(blank=True)
    side_effects = models.TextField(blank=True)
    precautions = models.TextField(blank=True)
    # Availability
    is_available = models.BooleanField(default=True)
    stock = models.IntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name', 'generic_name']),
        ]
    
    def __str__(self):
        return f"{self.name} {self.strength}{self.strength_unit}"


class EMedicineOrder(models.Model):
    """Medicine orders placed by patients"""
    
    URGENCY_CHOICES = [
        ('normal', 'Normal'),
        ('urgent', 'Urgent'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    order_id = models.CharField(max_length=50, unique=True, editable=False)
    
    patient_name = models.CharField(max_length=200)
    contact_phone = models.CharField(max_length=20)
    delivery_address = models.TextField()
    
    pharmacy = models.ForeignKey(EMedicinePharmacy, on_delete=models.CASCADE, related_name='orders')
    medicines_list = models.JSONField(default=dict, help_text="List of medicines with quantities")
    delivered_medicines_list = models.JSONField(default=dict, help_text="List of delivered medicines with quantities - tracks which medicines have been delivered")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Payment tracking
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    payment = models.ForeignKey('payments.Payment', on_delete=models.SET_NULL, null=True, blank=True, related_name='medicine_orders')
    
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='normal')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    required_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['order_id']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.order_id:
            # Generate unique order ID: EM + timestamp + random 4 digits
            timestamp = str(int(time.time() * 1000))[-8:]  # Last 8 digits of timestamp
            random_suffix = str(random.randint(1000, 9999))
            self.order_id = f"EM{timestamp}{random_suffix}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Order {self.order_id} - {self.patient_name}"
