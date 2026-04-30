from rest_framework import serializers
from .models import District, Upazila


class DistrictListSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ['id', 'name', 'code', 'region']


class DistrictSerializer(serializers.ModelSerializer):
    upazilas = serializers.SerializerMethodField()
    
    class Meta:
        model = District
        fields = ['id', 'name', 'code', 'region', 'upazilas']
    
    def get_upazilas(self, obj):
        upazilas = obj.upazilas.all()
        return UpazilaSerializer(upazilas, many=True).data


class UpazilaSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source='district.name', read_only=True)
    
    class Meta:
        model = Upazila
        fields = ['id', 'name', 'code', 'district', 'district_name']


class UpazilaListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Upazila
        fields = ['id', 'name', 'code', 'district']
