from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User
from apps.hospitals.models import Hospital


class Doctor(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True, related_name='doctors')
    bmdc_number = models.CharField(max_length=50, unique=True)
    specialty = models.CharField(max_length=150, db_index=True)
    subspecialty = models.CharField(max_length=150, null=True, blank=True)
    qualifications = models.TextField()
    experience_years = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    follow_up_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    chamber_address = models.TextField(null=True, blank=True)
    available_days = models.CharField(max_length=100, null=True, blank=True, help_text="e.g., Mon,Tue,Wed")
    available_time_start = models.TimeField(null=True, blank=True)
    available_time_end = models.TimeField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    languages = models.CharField(max_length=255, default='Bengali,English')
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, validators=[MinValueValidator(0), MaxValueValidator(5)])
    review_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    is_verified = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'doctors'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['specialty']),
            models.Index(fields=['is_verified']),
            models.Index(fields=['is_available']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name} ({self.specialty})"


class DoctorReview(models.Model):
    id = models.AutoField(primary_key=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='reviews')
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='doctor_reviews')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    title = models.CharField(max_length=200, blank=True, null=True)
    review_text = models.TextField(help_text="Patient's experience with this doctor")
    is_verified_patient = models.BooleanField(
        default=False, 
        help_text="Checked if patient has completed an appointment with this doctor"
    )
    helpful_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'doctor_reviews'
        ordering = ['-created_at']
        unique_together = ('doctor', 'patient')
        indexes = [
            models.Index(fields=['doctor']),
            models.Index(fields=['patient']),
            models.Index(fields=['rating']),
            models.Index(fields=['is_verified_patient']),
        ]
    
    def __str__(self):
        return f"Review by {self.patient.first_name} for {self.doctor.user.first_name} ({self.rating}★)"
