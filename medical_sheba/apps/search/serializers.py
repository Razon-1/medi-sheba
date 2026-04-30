from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'reviewer', 'reviewer_name', 'target_type', 'target_id',
            'appointment', 'rating', 'comment', 'is_visible',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_reviewer_name(self, obj):
        return f"{obj.reviewer.first_name} {obj.reviewer.last_name}"


class ReviewListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            'id', 'target_type', 'target_id', 'rating', 'comment', 'created_at'
        ]
