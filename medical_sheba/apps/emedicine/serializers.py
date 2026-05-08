from rest_framework import serializers
from .models import EMedicinePharmacy, MedicineItem, EMedicineOrder


class MedicineItemSerializer(serializers.ModelSerializer):
    """Serializer for medicine items"""
    
    class Meta:
        model = MedicineItem
        fields = [
            'id', 'pharmacy', 'name', 'generic_name', 'manufacturer', 'medicine_type',
            'strength', 'strength_unit', 'price', 'description', 'side_effects',
            'precautions', 'is_available', 'stock', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'pharmacy', 'created_at', 'updated_at']


class EMedicinePharmacyListSerializer(serializers.ModelSerializer):
    """List serializer for pharmacies - basic info"""
    
    district_name = serializers.CharField(source='district.name', read_only=True)
    upazila_name = serializers.CharField(source='upazila.name', read_only=True)
    admin_user_name = serializers.CharField(source='admin_user.get_full_name', read_only=True)
    
    class Meta:
        model = EMedicinePharmacy
        fields = [
            'id', 'name', 'pharmacy_type', 'phone_number', 'email', 'address',
            'district_name', 'upazila_name', 'delivery_time_hours', 'min_order_amount',
            'delivery_charge', 'is_available', 'is_verified', 'rating', 'review_count',
            'admin_user_name'
        ]


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
            'delivery_charge', 'is_available', 'is_verified', 'rating', 'review_count',
            'medicines', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_verified', 'rating', 'review_count']


class EMedicineOrderListSerializer(serializers.ModelSerializer):
    """List serializer for orders - summary info"""
    
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    
    class Meta:
        model = EMedicineOrder
        fields = [
            'id', 'order_id', 'patient_name', 'contact_phone', 'pharmacy_name',
            'total_amount', 'urgency', 'status', 'required_date', 'created_at'
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
            'total_amount', 'urgency', 'status', 'required_date', 'notes',
            'created_at', 'updated_at'
        ]


class EMedicineOrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    
    class Meta:
        model = EMedicineOrder
        fields = [
            'patient_name', 'contact_phone', 'delivery_address',
            'pharmacy', 'medicines_list', 'total_amount', 'urgency',
            'required_date', 'notes'
        ]
