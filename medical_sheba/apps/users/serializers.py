from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=6)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone', 'first_name', 'last_name', 'password',
            'role', 'blood_group', 'date_of_birth', 'gender', 'profile_image',
            'address', 'district', 'upazila', 'is_active', 'is_verified',
            'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_login', 'created_at', 'updated_at']
        extra_kwargs = {
            'first_name': {'required': True, 'allow_blank': False},
            'last_name': {'required': True, 'allow_blank': False},
            'email': {'required': True},
            'phone': {'required': True},
        }
    
    def validate_email(self, value):
        """Check if email already exists during registration"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value
    
    def validate_phone(self, value):
        """Check if phone already exists during registration"""
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError('This phone number is already registered.')
        return value
    
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
