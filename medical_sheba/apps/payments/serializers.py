from rest_framework import serializers
from .models import Payment, Subscription, PaymentIntent
from apps.users.models import User


class PaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    gateway_display = serializers.CharField(source='get_gateway_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'transaction_id', 'user', 'user_name', 'hospital', 'hospital_name', 'pharmacy', 'pharmacy_name',
            'amount', 'currency', 'gateway', 'gateway_display', 'payment_type',
            'payment_type_display', 'reference_id', 'reference_type', 'hospital_payment_number', 'pharmacy_payment_number',
            'status', 'status_display', 'gateway_reference', 'gateway_response',
            'verification_token', 'mobile_number', 'mobile_name', 'card_holder_name', 'card_last_four', 'refund_amount',
            'refund_reason', 'refunded_at', 'created_at', 'updated_at', 'paid_at'
        ]
        read_only_fields = [
            'id', 'transaction_id', 'gateway_response', 'created_at', 'updated_at', 'paid_at'
        ]
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


class PaymentListSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.CharField(source='user.email', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    gateway_display = serializers.CharField(source='get_gateway_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'transaction_id', 'user', 'user_name', 'user_email', 'hospital_name',
            'pharmacy_name', 'amount', 'currency', 'gateway', 'gateway_display',
            'payment_type', 'payment_type_display', 'reference_id', 'reference_type',
            'status', 'status_display', 'created_at', 'paid_at'
        ]

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.email


class PaymentInitiateSerializer(serializers.ModelSerializer):
    """For initiating/creating a new payment"""
    class Meta:
        model = Payment
        fields = [
            'amount', 'gateway', 'payment_type', 'reference_id', 'reference_type',
            'mobile_number', 'mobile_name', 'card_holder_name', 'card_last_four'
        ]


class PaymentVerifySerializer(serializers.Serializer):
    """For verifying payment"""
    transaction_id = serializers.CharField(max_length=100)
    gateway_reference = serializers.CharField(max_length=200, required=False)
    verification_token = serializers.CharField(max_length=200, required=False)
    gateway_response = serializers.JSONField(required=False)


class SubscriptionSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    plan_display = serializers.CharField(source='get_plan_display', read_only=True)
    duration_display = serializers.CharField(source='get_duration_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_active = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'user', 'user_email', 'plan', 'plan_display', 'duration',
            'duration_display', 'amount', 'status', 'status_display', 'is_active',
            'start_date', 'end_date', 'renewal_date', 'payment', 'features', 'is_trial',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'start_date']
    
    def get_user_email(self, obj):
        return obj.user.email
    
    def get_is_active(self, obj):
        return obj.is_active()


class SubscriptionListSerializer(serializers.ModelSerializer):
    user = serializers.IntegerField(source='user_id', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    plan_display = serializers.CharField(source='get_plan_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_active = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'user', 'user_email', 'plan', 'plan_display', 'duration', 'amount',
            'status', 'status_display', 'is_active', 'is_trial', 'start_date',
            'end_date', 'created_at'
        ]
    
    def get_is_active(self, obj):
        return obj.is_active()


class PaymentIntentSerializer(serializers.ModelSerializer):
    payment = PaymentSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = PaymentIntent
        fields = [
            'id', 'payment', 'session_token', 'status', 'status_display',
            'verification_attempts', 'last_verification_at', 'metadata',
            'created_at', 'updated_at', 'expires_at'
        ]
        read_only_fields = [
            'id', 'payment', 'session_token', 'status', 'verification_attempts',
            'last_verification_at', 'created_at', 'updated_at'
        ]
