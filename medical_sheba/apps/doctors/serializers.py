from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from .models import Doctor, DoctorReview
from apps.users.models import User
from apps.users.serializers import UserSerializer
from apps.users.validators import (
    normalize_phone_number,
    validate_bangladesh_phone_number,
    validate_gmail_address,
    validate_person_name,
)


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # User fields for creating/updating users
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    phone_number = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'user_id', 'hospital', 'bmdc_number', 'specialty',
            'subspecialty', 'qualifications', 'experience_years', 'consultation_fee',
            'follow_up_fee', 'chamber_address', 'available_days', 'available_time_start',
            'available_time_end', 'bio', 'languages', 'rating', 'review_count',
            'is_verified', 'is_available', 'requires_authentication', 'created_at', 'updated_at',
            'image_url', 'first_name', 'last_name', 'email', 'phone_number'
        ]
        read_only_fields = ['id', 'rating', 'review_count', 'created_at', 'updated_at', 'is_verified']

    def validate_first_name(self, value):
        value = (value or '').strip()
        if value:
            validate_person_name(value)
        return value

    def validate_last_name(self, value):
        value = (value or '').strip()
        if value:
            validate_person_name(value)
        return value

    def validate_email(self, value):
        value = (value or '').strip().lower()
        validate_gmail_address(value)

        queryset = User.objects.filter(email__iexact=value)
        if self.instance and self.instance.user_id:
            queryset = queryset.exclude(pk=self.instance.user_id)
        if queryset.exists():
            raise serializers.ValidationError('This email address is already registered.')
        return value

    def validate_phone_number(self, value):
        value = normalize_phone_number(value)
        validate_bangladesh_phone_number(value)

        queryset = User.objects.filter(phone=value)
        if self.instance and self.instance.user_id:
            queryset = queryset.exclude(pk=self.instance.user_id)
        if queryset.exists():
            raise serializers.ValidationError('This phone number is already registered.')
        return value

    def validate_user_id(self, value):
        if value in (None, ''):
            return None

        try:
            user = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError('Selected user was not found.')

        linked_doctor = getattr(user, 'doctor_profile', None)
        if linked_doctor and (not self.instance or linked_doctor.pk != self.instance.pk):
            raise serializers.ValidationError('Selected user is already linked to another doctor.')

        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)

        if not self.instance and not attrs.get('user_id'):
            errors = {}
            if not attrs.get('email'):
                errors['email'] = 'Email is required to create a new doctor.'
            if not attrs.get('phone_number'):
                errors['phone_number'] = 'Phone number is required to create a new doctor.'
            if errors:
                raise serializers.ValidationError(errors)

        return attrs
    
    def create(self, validated_data):
        # Extract user-related fields
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        email = validated_data.pop('email', '')
        phone_number = validated_data.pop('phone_number', '')
        user_id = validated_data.pop('user_id', None)
        
        try:
            with transaction.atomic():
                # Either use provided user_id or create a new user.
                if user_id:
                    user = User.objects.get(id=user_id)
                    if not user.has_role('doctor'):
                        user.add_role('doctor')
                else:
                    user = User.objects.create_user(
                        email=email,
                        phone=phone_number,
                        first_name=first_name,
                        last_name=last_name,
                        roles=['doctor']
                    )

                validated_data['user'] = user
                return super().create(validated_data)
        except User.DoesNotExist:
            raise serializers.ValidationError({'user_id': 'Selected user was not found.'})
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict if hasattr(exc, 'message_dict') else exc.messages)
        except IntegrityError:
            raise serializers.ValidationError(
                {'non_field_errors': ['Doctor could not be created because one of the unique fields already exists.']}
            )
    
    def update(self, instance, validated_data):
        # Extract user-related fields
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        email = validated_data.pop('email', None)
        phone_number = validated_data.pop('phone_number', None)
        user_id = validated_data.pop('user_id', None)
        
        # Update user if provided
        if user_id:
            user = User.objects.get(id=user_id)
            instance.user = user
        elif any([first_name, last_name, email, phone_number]):
            # Update existing user with provided fields
            user = instance.user
            if first_name:
                user.first_name = first_name
            if last_name:
                user.last_name = last_name
            if email:
                user.email = email
            if phone_number:
                user.phone = phone_number
            user.save()
        
        return super().update(instance, validated_data)


class DoctorListSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    hospital_name = serializers.SerializerMethodField()
    hospital_id = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'user_name', 'specialty', 'hospital_id', 'hospital_name', 'consultation_fee',
            'rating', 'is_available', 'is_verified', 'image_url', 'experience_years',
            'qualifications', 'review_count', 'available_days', 'available_time_start',
            'available_time_end', 'phone', 'user', 'requires_authentication'
        ]
    
    def get_phone(self, obj):
        return obj.hospital.phone_primary if obj.hospital else 'N/A'
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_hospital_name(self, obj):
        return obj.hospital.name if obj.hospital else "Private Practice"

    def get_hospital_id(self, obj):
        return obj.hospital_id


class DoctorReviewSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = DoctorReview
        fields = [
            'id', 'doctor', 'doctor_id', 'patient', 'patient_name', 'rating', 
            'title', 'review_text', 'is_verified_patient', 'helpful_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'doctor', 'patient', 'patient_name', 'helpful_count', 'created_at', 'updated_at']
    
    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"
    
    def create(self, validated_data):
        validated_data['patient'] = self.context['request'].user
        validated_data['doctor_id'] = validated_data.pop('doctor_id')
        return super().create(validated_data)
