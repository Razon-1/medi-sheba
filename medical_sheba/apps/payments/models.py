from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from apps.users.models import User


class Payment(models.Model):
    GATEWAY_CHOICES = [
        ('bkash', 'bKash'),
        ('nagad', 'Nagad'),
        ('card', 'Card'),
        ('rocket', 'Rocket'),
    ]
    
    PAYMENT_TYPE_CHOICES = [
        ('appointment', 'Doctor Appointment'),
        ('edoctor', 'E-Doctor Consultation'),
        ('ambulance', 'Ambulance Service'),
        ('medicine', 'Medicine/Order'),
        ('subscription', 'Subscription Plan'),
        ('blood_donation', 'Blood Donation'),
        ('donation', 'General Donation'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.AutoField(primary_key=True)
    transaction_id = models.CharField(max_length=100, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    hospital = models.ForeignKey('hospitals.Hospital', on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    pharmacy = models.ForeignKey('emedicine.EMedicinePharmacy', on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    currency = models.CharField(max_length=3, default='BDT')
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    reference_id = models.CharField(max_length=50, null=True, blank=True)
    reference_type = models.CharField(max_length=50, null=True, blank=True)
    hospital_payment_number = models.CharField(max_length=20, null=True, blank=True, help_text="Hospital's primary payment number for this transaction")
    pharmacy_payment_number = models.CharField(max_length=20, null=True, blank=True, help_text="Pharmacy's primary payment number for this transaction")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    
    # Gateway specific fields
    gateway_reference = models.CharField(max_length=200, null=True, blank=True)  # bKash/Nagad/Rocket payment ID
    gateway_response = models.JSONField(null=True, blank=True)
    verification_token = models.CharField(max_length=200, null=True, blank=True)
    
    # Mobile money specific fields
    mobile_number = models.CharField(max_length=20, null=True, blank=True)
    mobile_name = models.CharField(max_length=100, null=True, blank=True)

    # Card specific fields
    card_holder_name = models.CharField(max_length=100, null=True, blank=True)
    card_last_four = models.CharField(max_length=4, null=True, blank=True)
    
    # Refund information
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    refund_reason = models.TextField(null=True, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['payment_type']),
            models.Index(fields=['gateway']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.transaction_id} - {self.amount} BDT ({self.status})"
    
    def mark_as_success(self):
        """Mark payment as successful"""
        self.status = 'success'
        self.paid_at = timezone.now()
        self.save()
    
    def mark_as_failed(self):
        """Mark payment as failed"""
        self.status = 'failed'
        self.save()


class Subscription(models.Model):
    PLAN_CHOICES = [
        ('basic', 'Basic'),
        ('premium', 'Premium'),
        ('professional', 'Professional'),
    ]
    
    DURATION_CHOICES = [
        ('monthly', '1 Month'),
        ('quarterly', '3 Months'),
        ('annual', '1 Year'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES)
    duration = models.CharField(max_length=20, choices=DURATION_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Subscription period
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    renewal_date = models.DateTimeField(null=True, blank=True)
    
    # Payment reference
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True, related_name='subscriptions')
    
    # Features included
    features = models.JSONField(default=dict)
    # Flag for one-time trial subscriptions
    is_trial = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subscriptions'
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['plan']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.plan} ({self.status})"
    
    def is_active(self):
        """Check if subscription is currently active"""
        return self.status == 'active' and self.end_date > timezone.now()


class PaymentIntent(models.Model):
    """Track payment processing and verification"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.AutoField(primary_key=True)
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='intent')
    session_token = models.CharField(max_length=200, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Verification details
    verification_attempts = models.IntegerField(default=0)
    last_verification_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'payment_intents'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['session_token']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Intent for Payment {self.payment.transaction_id}"
    
    def is_expired(self):
        """Check if payment intent has expired"""
        return timezone.now() > self.expires_at
