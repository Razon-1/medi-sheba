from rest_framework import serializers
from django.core.validators import URLValidator
from django.utils import timezone

from .models import User
from .validators import (
    normalize_phone_number,
    validate_bangladesh_phone_number,
    validate_gmail_address,
    validate_person_name,
    validate_place_name,
    validate_strong_password,
)


ADMIN_ROLES = {'pharmacy_admin', 'hospital_admin', 'ambulance_driver_admin'}
MAX_AGE_YEARS = 120


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=False, min_length=8)
    full_name = serializers.CharField(write_only=True, required=False, allow_blank=False)
    roles = serializers.ListField(child=serializers.CharField(), required=False, allow_empty=False)
    phone_number = serializers.CharField(source='phone', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone', 'phone_number', 'first_name', 'last_name', 'password', 'full_name',
            'roles', 'blood_group', 'date_of_birth', 'gender', 'profile_image',
            'address', 'district', 'upazila', 'is_active', 'is_verified', 'is_staff', 'is_superuser',
            'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_staff', 'is_superuser', 'last_login', 'created_at', 'updated_at']
        extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': False},
            'last_name': {'required': False, 'allow_blank': False},
            'email': {'required': True, 'allow_blank': False},
            'phone': {'required': True, 'allow_blank': False},
        }
    
    def validate_email(self, value):
        """Validate Gmail-only user accounts and unique email addresses."""
        value = value.strip().lower()
        validate_gmail_address(value)

        queryset = User.objects.filter(email__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError('This email is already registered.')
        return value
    
    def validate_phone(self, value):
        """Validate Bangladesh mobile numbers and unique phone numbers."""
        value = normalize_phone_number(value)
        validate_bangladesh_phone_number(value)

        queryset = User.objects.filter(phone=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError('This phone number is already registered.')
        return value

    def validate_password(self, value):
        validate_strong_password(value)
        return value

    def validate_first_name(self, value):
        value = value.strip()
        validate_person_name(value)
        return value

    def validate_last_name(self, value):
        value = value.strip()
        validate_person_name(value)
        return value

    def validate_date_of_birth(self, value):
        today = timezone.localdate()
        if value > today:
            raise serializers.ValidationError('Date of birth cannot be in the future.')
        if today.year - value.year > MAX_AGE_YEARS:
            raise serializers.ValidationError(f'Date of birth cannot be more than {MAX_AGE_YEARS} years ago.')
        return value

    def validate_profile_image(self, value):
        value = (value or '').strip()
        if not value:
            return None

        validator = URLValidator(schemes=['http', 'https'])
        validator(value)
        return value

    def validate_address(self, value):
        value = (value or '').strip()
        if not value:
            return None
        if len(value) < 5:
            raise serializers.ValidationError('Address must be at least 5 characters long.')
        if len(value) > 1000:
            raise serializers.ValidationError('Address must be 1000 characters or fewer.')
        return value

    def validate_district(self, value):
        value = (value or '').strip()
        if not value:
            return None
        validate_place_name(value)
        return value

    def validate_upazila(self, value):
        value = (value or '').strip()
        if not value:
            return None
        validate_place_name(value)
        return value
    
    def validate(self, data):
        """Handle full_name splitting and validate required fields"""
        full_name = data.pop('full_name', '').strip()

        if self.instance is None and not data.get('password'):
            raise serializers.ValidationError({'password': 'This field is required.'})
        
        # If full_name is provided, split it into first_name and last_name
        if full_name:
            name_parts = full_name.split(maxsplit=1)
            data['first_name'] = name_parts[0]
            data['last_name'] = name_parts[1] if len(name_parts) > 1 else name_parts[0]
            validate_person_name(data['first_name'])
            validate_person_name(data['last_name'])
        
        # Ensure first_name and last_name are not empty
        first_name = data.get('first_name') or getattr(self.instance, 'first_name', None)
        last_name = data.get('last_name') or getattr(self.instance, 'last_name', None)
        if not first_name:
            raise serializers.ValidationError({'first_name': 'This field is required.'})
        if not last_name:
            raise serializers.ValidationError({'last_name': 'This field is required.'})
        
        # Handle roles - ensure at least one role is provided during registration
        roles = data.get('roles')
        if not roles:
            data['roles'] = ['patient']  # Default to patient role
        else:
            # Validate that all provided roles are valid
            valid_roles = [choice[0] for choice in User.ROLE_CHOICES]
            for role in roles:
                if role not in valid_roles:
                    raise serializers.ValidationError({'roles': f'Invalid role: {role}'})

            unique_roles = list(dict.fromkeys(roles))
            if 'patient' in unique_roles and ADMIN_ROLES.intersection(unique_roles):
                raise serializers.ValidationError({
                    'roles': 'Patient role cannot be combined with admin roles.'
                })
            data['roles'] = unique_roles
        
        return data
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UserDetailSerializer(UserSerializer):
    """Extended serializer with related data"""
    pass
