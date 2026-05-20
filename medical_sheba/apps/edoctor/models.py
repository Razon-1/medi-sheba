from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

User = get_user_model()


class EDoctorProfile(models.Model):
    """Doctor profile for online consultation"""
    
    SPECIALIZATION_CHOICES = [
        ('general', 'General Practitioner'),
        ('cardiology', 'Cardiology'),
        ('neurology', 'Neurology'),
        ('pediatrics', 'Pediatrics'),
        ('orthopedics', 'Orthopedics'),
        ('dermatology', 'Dermatology'),
        ('psychiatry', 'Psychiatry'),
        ('gynecology', 'Gynecology'),
        ('urology', 'Urology'),
        ('ophthalmology', 'Ophthalmology'),
        ('ent', 'ENT'),
        ('dentistry', 'Dentistry'),
    ]

    QUALIFICATION_CHOICES = [
        ('mbbs', 'MBBS'),
        ('md', 'MD'),
        ('ms', 'MS'),
        ('bds', 'BDS'),
        ('phd', 'PhD'),
        ('dm', 'DM'),
    ]

    # Hospital relationship
    hospital = models.ForeignKey('hospitals.Hospital', on_delete=models.SET_NULL, null=True, blank=True, related_name='edoctors')
    
    # Basic Info
    doctor_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES)
    qualification = models.CharField(max_length=50, choices=QUALIFICATION_CHOICES)
    experience_years = models.IntegerField(validators=[MinValueValidator(0)])
    registration_number = models.CharField(max_length=100, unique=True)

    # Contact & Location
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    hospital_name = models.CharField(max_length=255, blank=True)
    consultation_address = models.TextField(blank=True)

    # Consultation Info
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])
    consultation_duration_minutes = models.IntegerField(default=30, validators=[MinValueValidator(15)])
    languages_spoken = models.CharField(max_length=255, default='Bengali, English')

    # Availability
    available_days = models.CharField(max_length=100, default='Monday, Tuesday, Wednesday, Thursday, Friday')
    available_start_time = models.TimeField(default='09:00')
    available_end_time = models.TimeField(default='18:00')
    availability_schedule = models.JSONField(default=list, blank=True)
    is_available = models.BooleanField(default=True)
    requires_authentication = models.BooleanField(default=False, help_text="Patient must be logged in to book consultation")

    # Verification & Rating
    is_verified = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    review_count = models.IntegerField(default=0)

    # Bio and qualifications
    bio = models.TextField(blank=True)
    specialties = models.TextField(blank=True)  # Comma-separated specialties
    
    # Image
    image_url = models.CharField(max_length=500, null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_verified', '-rating']
        indexes = [
            models.Index(fields=['is_available', 'is_verified']),
            models.Index(fields=['specialization', 'is_available']),
        ]

    def __str__(self):
        return f"Dr. {self.name}"


class ConsultationSlot(models.Model):
    """Available consultation time slots"""

    SLOT_STATUS_CHOICES = [
        ('available', 'Available'),
        ('booked', 'Booked'),
        ('cancelled', 'Cancelled'),
    ]

    doctor = models.ForeignKey(EDoctorProfile, on_delete=models.CASCADE, related_name='consultation_slots')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_available = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=SLOT_STATUS_CHOICES, default='available')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['doctor', 'status']),
            models.Index(fields=['start_time', 'is_available']),
        ]

    def __str__(self):
        return f"Slot for {self.doctor.name} at {self.start_time}"


class EDoctorConsultation(models.Model):
    """Online doctor consultation booking"""

    URGENCY_CHOICES = [
        ('routine', 'Routine'),
        ('urgent', 'Urgent'),
        ('critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]

    # Consultation ID and basic info
    consultation_id = models.CharField(max_length=50, unique=True, editable=False)
    doctor = models.ForeignKey(EDoctorProfile, on_delete=models.PROTECT, related_name='consultations')
    slot = models.OneToOneField(ConsultationSlot, on_delete=models.SET_NULL, null=True, blank=True, related_name='consultation')

    # Patient info
    patient_name = models.CharField(max_length=255)
    patient_email = models.EmailField()
    patient_phone = models.CharField(max_length=20)
    patient_age = models.IntegerField(null=True, blank=True)

    # Consultation details
    chief_complaint = models.TextField()
    medical_history = models.TextField(blank=True)
    consultation_notes = models.TextField(blank=True)
    prescription = models.TextField(blank=True)

    # Scheduling
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='routine')

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    fee_amount = models.DecimalField(max_digits=8, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    
    # Payment tracking
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    payment = models.ForeignKey('payments.Payment', on_delete=models.SET_NULL, null=True, blank=True, related_name='edoctor_consultations')

    # Links
    video_call_link = models.URLField(blank=True)
    meeting_password = models.CharField(max_length=100, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_date', '-scheduled_time']
        indexes = [
            models.Index(fields=['status', 'scheduled_date']),
            models.Index(fields=['consultation_id']),
        ]

    def save(self, *args, **kwargs):
        """Generate consultation ID if not exists"""
        if not self.consultation_id:
            import random
            self.consultation_id = f"ED{uuid.uuid4().hex[:8].upper()}{random.randint(1000, 9999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Consultation {self.consultation_id} - {self.patient_name}"
