from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=6)
    full_name = serializers.CharField(write_only=True, required=False, allow_blank=False)
    roles = serializers.ListField(child=serializers.CharField(), required=False, allow_empty=False)
    phone_number = serializers.CharField(source='phone', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone', 'phone_number', 'first_name', 'last_name', 'password', 'full_name',
            'roles', 'blood_group', 'date_of_birth', 'gender', 'profile_image',
            'address', 'district', 'upazila', 'is_active', 'is_verified',
            'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_login', 'created_at', 'updated_at']
        extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
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
    
    def validate(self, data):
        """Handle full_name splitting and validate required fields"""
        full_name = data.pop('full_name', '').strip()
        
        # If full_name is provided, split it into first_name and last_name
        if full_name:
            name_parts = full_name.split(maxsplit=1)
            data['first_name'] = name_parts[0]
            data['last_name'] = name_parts[1] if len(name_parts) > 1 else name_parts[0]
        
        # Ensure first_name and last_name are not empty
        if not data.get('first_name'):
            raise serializers.ValidationError({'first_name': 'This field is required.'})
        if not data.get('last_name'):
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
