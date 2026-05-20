from rest_framework import serializers
from .models import Doctor, DoctorReview
from apps.users.models import User
from apps.users.serializers import UserSerializer


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
    
    def create(self, validated_data):
        # Extract user-related fields
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        email = validated_data.pop('email', '')
        phone_number = validated_data.pop('phone_number', '')
        user_id = validated_data.pop('user_id', None)
        
        # Either use provided user_id or create a new user
        if user_id:
            user = User.objects.get(id=user_id)
        else:
            if not email or not phone_number:
                raise serializers.ValidationError("Email and phone_number are required to create a new doctor")
            
            # Create a new user with the provided information
            user = User.objects.create_user(
                email=email,
                phone=phone_number,
                first_name=first_name,
                last_name=last_name,
                roles=['doctor']
            )
        
        validated_data['user'] = user
        return super().create(validated_data)
    
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
    phone = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'user_name', 'specialty', 'hospital_name', 'consultation_fee',
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
