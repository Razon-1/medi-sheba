from django.db import models
from django.core.validators import MinValueValidator
from apps.users.models import User
from apps.doctors.models import Doctor
from apps.hospitals.models import Hospital


class Appointment(models.Model):
    TYPE_CHOICES = [
        ('new', 'New'),
        ('follow_up', 'Follow-up'),
        ('emergency', 'Emergency'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.AutoField(primary_key=True)
    appointment_no = models.CharField(max_length=20, unique=True)
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')
    appointment_date = models.DateField(db_index=True, null=True, blank=True, help_text="Set by admin after phone confirmation")
    appointment_time = models.TimeField(null=True, blank=True, help_text="Set by admin after phone confirmation")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='new')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    symptoms = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    prescription_url = models.CharField(max_length=500, null=True, blank=True)
    fee_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    payment = models.ForeignKey('payments.Payment', on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')
    reminder_sent = models.BooleanField(default=False)
    cancelled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='cancelled_appointments')
    cancel_reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'appointments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['appointment_date']),
            models.Index(fields=['status']),
            models.Index(fields=['patient']),
            models.Index(fields=['doctor']),
        ]
    
    def __str__(self):
        return f"{self.appointment_no} - {self.patient.get_full_name()} & Dr. {self.doctor.user.get_full_name()}"
