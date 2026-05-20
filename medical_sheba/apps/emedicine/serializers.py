from rest_framework import serializers
from .models import EMedicinePharmacy, MedicineItem, EMedicineOrder
from apps.location.models import District, Upazila


class MedicineItemSerializer(serializers.ModelSerializer):
    """Serializer for medicine items"""
    
    class Meta:
        model = MedicineItem
        fields = [
            'id', 'pharmacy', 'name', 'generic_name', 'manufacturer', 'medicine_type',
            'strength', 'strength_unit', 'price', 'description', 'side_effects',
            'precautions', 'is_available', 'stock', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'pharmacy': {'required': False},
        }


class EMedicinePharmacyListSerializer(serializers.ModelSerializer):
    """List serializer for pharmacies - basic info"""
    
    district_name = serializers.CharField(source='district.name', read_only=True)
    upazila_name = serializers.CharField(source='upazila.name', read_only=True)
    admin_user_name = serializers.CharField(source='admin_user.get_full_name', read_only=True)
    
    class Meta:
        model = EMedicinePharmacy
        fields = [
            'id', 'name', 'pharmacy_type', 'phone_number', 'email', 'address',
            'license_number', 'image_url',
            'district_name', 'upazila_name', 'delivery_time_hours', 'min_order_amount',
            'delivery_charge', 'is_available', 'is_verified', 'rating', 'review_count',
            'admin_user_name'
        ]
        read_only_fields = ['is_verified', 'rating', 'review_count', 'admin_user_name']


class EMedicinePharmacyDetailSerializer(serializers.ModelSerializer):
    """Detail serializer for pharmacies - full info"""
    
    district_name = serializers.CharField(source='district.name', read_only=True)
    upazila_name = serializers.CharField(source='upazila.name', read_only=True)
    medicines = MedicineItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = EMedicinePharmacy
        fields = [
            'id', 'admin_user', 'name', 'pharmacy_type', 'license_number', 'phone_number', 'email',
            'address', 'district', 'district_name', 'upazila', 'upazila_name',
            'latitude', 'longitude', 'delivery_time_hours', 'min_order_amount',
            'delivery_charge', 'image_url', 'is_available', 'is_verified', 'rating', 'review_count',
            'medicines', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'admin_user', 'created_at', 'updated_at', 'is_verified', 'rating', 'review_count']


class EMedicinePharmacyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating pharmacies - accepts district/upazila names"""
    
    district_name = serializers.CharField(write_only=True)
    upazila_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = EMedicinePharmacy
        fields = [
            'name', 'pharmacy_type', 'license_number', 'phone_number', 'email',
            'address', 'district_name', 'upazila_name', 'delivery_time_hours',
            'min_order_amount', 'delivery_charge', 'image_url'
        ]
    
    def create(self, validated_data):
        district_name = validated_data.pop('district_name')
        upazila_name = validated_data.pop('upazila_name', None)
        
        # Get or create district
        district, _ = District.objects.get_or_create(name=district_name)
        validated_data['district'] = district
        
        # Get upazila if provided
        if upazila_name:
            upazila, _ = Upazila.objects.get_or_create(
                name=upazila_name,
                district=district
            )
            validated_data['upazila'] = upazila
        
        return super().create(validated_data)


class EMedicineOrderListSerializer(serializers.ModelSerializer):
    """List serializer for orders - summary info"""
    
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    
    class Meta:
        model = EMedicineOrder
        fields = [
            'id', 'order_id', 'patient_name', 'contact_phone', 'delivery_address',
            'pharmacy_name', 'medicines_list', 'delivered_medicines_list',
            'total_amount', 'urgency', 'payment_status', 'status', 'required_date',
            'notes', 'created_at', 'updated_at'
        ]


class EMedicineOrderDetailSerializer(serializers.ModelSerializer):
    """Detail serializer for orders - full info"""
    
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    pharmacy_phone = serializers.CharField(source='pharmacy.phone_number', read_only=True)
    
    class Meta:
        model = EMedicineOrder
        fields = [
            'id', 'order_id', 'patient_name', 'contact_phone', 'delivery_address',
            'pharmacy', 'pharmacy_name', 'pharmacy_phone', 'medicines_list',
            'delivered_medicines_list', 'total_amount', 'urgency', 'payment_status',
            'payment', 'status', 'required_date', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['order_id', 'payment_status', 'payment', 'created_at', 'updated_at']


class EMedicineOrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    
    class Meta:
        model = EMedicineOrder
        fields = [
            'patient_name', 'contact_phone', 'delivery_address',
            'pharmacy', 'medicines_list', 'total_amount', 'urgency',
            'required_date', 'notes'
        ]
