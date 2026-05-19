from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from .validators import (
    normalize_phone_number,
    validate_bangladesh_phone_number,
    validate_gmail_address,
)


class CustomUserManager(BaseUserManager):
    def create_user(self, email, phone, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        if not phone:
            raise ValueError('Phone is required')
        
        email = self.normalize_email(email)
        validate_gmail_address(email)
        phone = normalize_phone_number(phone)
        validate_bangladesh_phone_number(phone)
        user = self.model(email=email, phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('roles', ['admin'])
        return self.create_user(email, phone, password, **extra_fields)


class User(AbstractBaseUser):
    ROLE_CHOICES = [
        ('patient', 'Patient'),
        ('pharmacy_admin', 'Pharmacy Admin'),
        ('hospital_admin', 'Hospital Admin'),
        ('doctor', 'Doctor'),
        ('admin', 'Admin'),
        ('donor', 'Donor'),
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
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True, db_index=True, validators=[validate_gmail_address])
    phone = models.CharField(max_length=20, unique=True, validators=[validate_bangladesh_phone_number])
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    roles = models.JSONField(default=list, help_text='List of roles for this user')
    blood_group = models.CharField(max_length=10, choices=BLOOD_GROUP_CHOICES, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, null=True, blank=True)
    profile_image = models.CharField(max_length=500, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    district = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    upazila = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    # Flag to indicate the user has completed their first payment
    has_made_first_payment = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
            models.Index(fields=['district']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def role(self):
        """Backward compatibility: returns primary role (first role)"""
        return self.roles[0] if self.roles else 'patient'
    
    @role.setter
    def role(self, value):
        """Backward compatibility: set as primary role"""
        if value not in [choice[0] for choice in self.ROLE_CHOICES]:
            raise ValueError(f"Invalid role: {value}")
        if value not in self.roles:
            self.roles = [value] + [r for r in self.roles if r != value]
    
    def has_role(self, role):
        """Check if user has a specific role"""
        return role in self.roles
    
    def add_role(self, role):
        """Add a role to the user"""
        if role not in [choice[0] for choice in self.ROLE_CHOICES]:
            raise ValueError(f"Invalid role: {role}")
        if role not in self.roles:
            self.roles.append(role)
            self.save()
        return self

    def has_active_subscription_access(self):
        """Check whether the user currently has an active subscription or trial."""
        from apps.payments.models import Subscription

        return Subscription.objects.filter(
            user=self,
            status='active',
            end_date__gt=timezone.now(),
        ).exists()
    
    def remove_role(self, role):
        """Remove a role from the user"""
        if role in self.roles:
            self.roles.remove(role)
            self.save()
        return self
    
    def has_perm(self, perm, obj=None):
        """Check if user has permission"""
        return self.is_superuser or self.is_staff
    
    def has_module_perms(self, app_label):
        """Check if user has any permissions in app_label"""
        return self.is_superuser or self.is_staff


class PasswordResetToken(models.Model):
    """Model to store password reset tokens with expiration"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=100, unique=True, db_index=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'password_reset_tokens'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['user', 'is_used']),
        ]
    
    def __str__(self):
        return f"Reset token for {self.user.email}"
    
    def is_valid(self):
        """Check if token is valid (not used and not expired)"""
        return not self.is_used and timezone.now() < self.expires_at
    
    def mark_as_used(self):
        """Mark token as used"""
        self.is_used = True
        self.save(update_fields=['is_used'])
