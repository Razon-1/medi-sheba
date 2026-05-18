from django.db import models
from django.core.validators import MinValueValidator
from apps.users.models import User
from apps.hospitals.models import Hospital


class BloodDonor(models.Model):
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
    ]
    
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='blood_donor')
    blood_group = models.CharField(max_length=10, choices=BLOOD_GROUP_CHOICES)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    last_donation_date = models.DateField(null=True, blank=True)
    total_donations = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    is_available = models.BooleanField(default=True)
    district = models.CharField(max_length=100, db_index=True)
    upazila = models.CharField(max_length=100, null=True, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    health_conditions = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'blood_donors'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['blood_group']),
            models.Index(fields=['district']),
            models.Index(fields=['is_available']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.blood_group}"


class BloodRequest(models.Model):
    URGENCY_CHOICES = [
        ('normal', 'Normal'),
        ('urgent', 'Urgent'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('fulfilled', 'Fulfilled'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
    ]
    
    id = models.AutoField(primary_key=True)
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blood_requests')
    patient_name = models.CharField(max_length=255)
    blood_group = models.CharField(max_length=10, choices=BLOOD_GROUP_CHOICES)
    units_required = models.IntegerField(validators=[MinValueValidator(1)])
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True, related_name='blood_requests')
    required_date = models.DateField()
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES)
    district = models.CharField(max_length=100, db_index=True)
    contact_phone = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'blood_requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['blood_group']),
            models.Index(fields=['district']),
            models.Index(fields=['urgency']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.patient_name} needs {self.blood_group} - {self.status}"
