from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'transaction_id', 'user', 'user_name', 'amount', 'currency',
            'gateway', 'payment_type', 'reference_id', 'reference_type', 'status',
            'gateway_response', 'refund_amount', 'refund_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'transaction_id', 'gateway_response', 'created_at', 'updated_at'
        ]
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


class PaymentListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'transaction_id', 'amount', 'currency', 'gateway',
            'payment_type', 'status', 'created_at'
        ]
