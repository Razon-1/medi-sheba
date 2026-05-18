from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import IntegrityError
from datetime import timedelta
from decimal import Decimal
import uuid
import secrets

from .models import Payment, Subscription, PaymentIntent
from .serializers import (
    PaymentSerializer, PaymentListSerializer, PaymentInitiateSerializer,
    PaymentVerifySerializer, SubscriptionSerializer, SubscriptionListSerializer,
    PaymentIntentSerializer
)
from apps.hospitals.models import Hospital
from apps.doctors.models import Doctor
from apps.edoctor.models import EDoctorProfile
from apps.ambulance.models import AmbulanceService
from apps.emedicine.models import EMedicineOrder, EMedicinePharmacy


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gateway', 'payment_type', 'status']
    search_fields = ['transaction_id', 'user__email', 'gateway_reference']
    ordering_fields = ['amount', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'admin':
            return Payment.objects.all()
        return Payment.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PaymentListSerializer
        elif self.action == 'initiate':
            return PaymentInitiateSerializer
        elif self.action == 'verify':
            return PaymentVerifySerializer
        return PaymentSerializer
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def initiate(self, request):
        """Initiate a new payment"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Generate unique transaction ID
        transaction_id = f"TXN-{request.user.id}-{timezone.now().timestamp()}-{uuid.uuid4().hex[:8]}"
        
        # Fetch hospital based on payment type and reference_id
        hospital = self._get_hospital_for_service(
            payment_type=serializer.validated_data.get('payment_type'),
            reference_id=serializer.validated_data.get('reference_id')
        )

        # Fetch pharmacy based on medicine order reference_id
        pharmacy = self._get_pharmacy_for_service(
            payment_type=serializer.validated_data.get('payment_type'),
            reference_id=serializer.validated_data.get('reference_id')
        )
        
        # Get hospital payment number
        hospital_payment_number = hospital.phone_primary if hospital else None

        # Get pharmacy payment number
        pharmacy_payment_number = pharmacy.phone_number if pharmacy else None
        
        # Create payment with hospital reference and payment number
        payment = Payment.objects.create(
            user=request.user,
            transaction_id=transaction_id,
            status='pending',
            hospital=hospital,
            hospital_payment_number=hospital_payment_number,
            pharmacy=pharmacy,
            pharmacy_payment_number=pharmacy_payment_number,
            **serializer.validated_data
        )
        
        # Create payment intent with session token
        session_token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(minutes=30)
        
        intent = PaymentIntent.objects.create(
            payment=payment,
            session_token=session_token,
            status='pending',
            expires_at=expires_at,
            metadata={
                'reference_id': payment.reference_id,
                'reference_type': payment.reference_type,
                'amount': str(payment.amount),
                'hospital_id': hospital.id if hospital else None,
                'pharmacy_id': pharmacy.id if pharmacy else None
            }
        )
        
        # Prepare response with payment details
        response_data = {
            'payment_id': payment.id,
            'transaction_id': payment.transaction_id,
            'session_token': session_token,
            'amount': payment.amount,
            'currency': payment.currency,
            'gateway': payment.gateway,
            'payment_type': payment.payment_type,
            'gateway_display': payment.get_gateway_display(),
            'status': payment.status,
            'expires_at': expires_at.isoformat(),
            'hospital_payment_number': hospital_payment_number,
            'hospital_name': hospital.name if hospital else None,
            'pharmacy_payment_number': pharmacy_payment_number,
            'pharmacy_name': pharmacy.name if pharmacy else None,
            'payment_instructions': self._get_payment_instructions(payment)
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    def _get_hospital_for_service(self, payment_type, reference_id):
        """Get hospital based on payment type and reference_id"""
        try:
            if payment_type == 'appointment' and reference_id:
                # Find doctor appointment and get hospital
                doctor = Doctor.objects.get(id=reference_id)
                return doctor.hospital
            
            elif payment_type == 'edoctor' and reference_id:
                # Find e-doctor and get hospital
                edoctor = EDoctorProfile.objects.get(id=reference_id)
                return edoctor.hospital
            
            elif payment_type == 'ambulance' and reference_id:
                # Find ambulance and get hospital
                ambulance = AmbulanceService.objects.get(id=reference_id)
                return ambulance.hospital
            
            elif payment_type == 'subscription':
                # Subscription doesn't belong to a specific hospital
                # Use user's primary hospital if available, otherwise None
                if hasattr(self.request.user, 'hospital_admin'):
                    return self.request.user.hospital_admin
                return None
            
            return None
        except (Doctor.DoesNotExist, EDoctorProfile.DoesNotExist, AmbulanceService.DoesNotExist):
            return None

    def _get_pharmacy_for_service(self, payment_type, reference_id):
        """Get pharmacy based on medicine payment reference_id"""
        try:
            if payment_type == 'medicine' and reference_id:
                order = EMedicineOrder.objects.select_related('pharmacy').get(id=reference_id)
                return order.pharmacy
            return None
        except EMedicineOrder.DoesNotExist:
            return None
    
    def _get_payment_instructions(self, payment):
        """Get payment instructions based on gateway and hospital"""
        payment_number = payment.pharmacy_payment_number or payment.hospital_payment_number or '01322458732'  # Fallback to default
        
        instructions = {
            'bkash': {
                'description': 'Send money to bKash',
                'phone': payment_number,
                'note': f'Send {payment.amount} BDT to merchant account and provide transaction ID'
            },
            'nagad': {
                'description': 'Send money to Nagad',
                'phone': payment_number,
                'note': f'Send {payment.amount} BDT to merchant account and provide transaction ID'
            },
            'card': {
                'description': 'Pay with Card',
                'note': f'Enter your card holder name, card last 4 digits, and transaction ID for {payment.amount} BDT'
            },
            'rocket': {
                'description': 'Send money to Rocket',
                'phone': payment_number,
                'note': f'Send {payment.amount} BDT to merchant account and provide transaction ID'
            },
        }
        return instructions.get(payment.gateway, {})
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def verify(self, request):
        """Verify payment using transaction ID and gateway reference"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        transaction_id = serializer.validated_data.get('transaction_id')
        gateway_reference = serializer.validated_data.get('gateway_reference')
        gateway_response = serializer.validated_data.get('gateway_response', {})
        
        try:
            payment = Payment.objects.get(transaction_id=transaction_id, user=request.user)
        except Payment.DoesNotExist:
            return Response(
                {'detail': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if payment already processed
        if payment.status == 'success':
            return Response({
                'detail': 'Payment already confirmed',
                'status': 'success',
                'transaction_id': payment.transaction_id
            })
        
        # For demonstration: Accept any non-empty gateway reference as valid
        # In production, verify with actual payment gateway APIs
        if gateway_reference:
            payment.status = 'success'
            payment.gateway_reference = gateway_reference
            payment.gateway_response = gateway_response
            payment.paid_at = timezone.now()
            payment.save()

            # Mark user as having completed first payment
            try:
                user = payment.user
                if not getattr(user, 'has_made_first_payment', False):
                    user.has_made_first_payment = True
                    user.save()
            except Exception:
                pass
            
            # Update payment intent
            if hasattr(payment, 'intent'):
                payment.intent.status = 'completed'
                payment.intent.last_verification_at = timezone.now()
                payment.intent.save()
            
            # Handle post-payment logic based on payment type
            self._handle_payment_success(payment)
            
            return Response({
                'detail': 'Payment verified successfully',
                'status': 'success',
                'transaction_id': payment.transaction_id,
                'amount': payment.amount,
                'paid_at': payment.paid_at
            })
        
        return Response(
            {'detail': 'Invalid gateway reference'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def _handle_payment_success(self, payment):
        """Handle post-payment logic based on payment type"""
        if payment.payment_type == 'subscription':
            self._handle_subscription_payment(payment)
        elif payment.payment_type == 'appointment':
            self._handle_appointment_payment(payment)
        elif payment.payment_type == 'edoctor':
            self._handle_edoctor_payment(payment)
        elif payment.payment_type == 'ambulance':
            self._handle_ambulance_payment(payment)
        elif payment.payment_type == 'medicine':
            self._handle_medicine_payment(payment)
    
    def _handle_subscription_payment(self, payment):
        """Mark subscription as active after payment"""
        # Link payment to subscription if reference_id is provided
        if payment.reference_id:
            try:
                subscription = Subscription.objects.get(id=payment.reference_id)
                subscription.payment = payment
                subscription.status = 'active'
                subscription.save()

                user = subscription.user
                if not getattr(user, 'has_made_first_payment', False):
                    user.has_made_first_payment = True
                    user.save(update_fields=['has_made_first_payment'])
            except Subscription.DoesNotExist:
                pass
    
    def _handle_appointment_payment(self, payment):
        """Update appointment payment status"""
        if payment.reference_id and payment.reference_type == 'appointment':
            try:
                from apps.appointments.models import Appointment
                appointment = Appointment.objects.get(id=payment.reference_id)
                appointment.payment = payment
                appointment.payment_status = 'paid'
                appointment.save()
            except Appointment.DoesNotExist:
                pass
    
    def _handle_edoctor_payment(self, payment):
        """Update e-doctor consultation payment status"""
        if payment.reference_id and payment.reference_type == 'edoctor':
            try:
                from apps.edoctor.models import EDoctorConsultation
                consultation = EDoctorConsultation.objects.get(id=payment.reference_id)
                consultation.payment = payment
                consultation.payment_status = 'paid'
                consultation.save()
            except:
                pass
    
    def _handle_ambulance_payment(self, payment):
        """Update ambulance request payment status"""
        if payment.reference_id and payment.reference_type == 'ambulance':
            try:
                from apps.ambulance.models import AmbulanceRequest
                request_obj = AmbulanceRequest.objects.get(id=payment.reference_id)
                request_obj.payment = payment
                request_obj.payment_status = 'paid'
                request_obj.save()
            except:
                pass
    
    def _handle_medicine_payment(self, payment):
        """Update medicine order payment status"""
        if payment.reference_id and payment.reference_type == 'medicine':
            try:
                from apps.emedicine.models import EMedicineOrder
                order = EMedicineOrder.objects.get(id=payment.reference_id)
                order.payment = payment
                order.payment_status = 'paid'
                order.save()
            except:
                pass
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def refund(self, request, pk=None):
        """Refund a payment"""
        payment = self.get_object()
        
        if payment.status != 'success':
            return Response(
                {'detail': 'Only successful payments can be refunded'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.status = 'refunded'
        payment.refund_amount = payment.amount
        payment.refund_reason = request.data.get('reason', '')
        payment.refunded_at = timezone.now()
        payment.save()
        
        return Response({
            'detail': 'Payment refunded successfully',
            'refund_amount': payment.refund_amount
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_payments(self, request):
        """Get all payments for current user"""
        payments = self.get_queryset()
        
        # Apply filters if provided
        status_filter = request.query_params.get('status')
        payment_type = request.query_params.get('payment_type')
        
        if status_filter:
            payments = payments.filter(status=status_filter)
        if payment_type:
            payments = payments.filter(payment_type=payment_type)
        
        serializer = PaymentListSerializer(payments, many=True)
        return Response(serializer.data)


class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['plan', 'status']
    ordering_fields = ['start_date', 'end_date']
    ordering = ['-start_date']
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'admin':
            return Subscription.objects.all()
        return Subscription.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SubscriptionListSerializer
        return SubscriptionSerializer
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def create_subscription(self, request):
        """Create a new subscription and initiate payment"""
        plan = request.data.get('plan')
        duration = request.data.get('duration')
        amount_override = request.data.get('amount')
        
        if not plan or not duration:
            return Response(
                {'detail': 'plan and duration are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        plan = str(plan).strip().lower()
        duration = str(duration).strip().lower()
        
        # Define subscription prices
        prices = {
            ('basic', 'monthly'): 99,
            ('basic', 'quarterly'): 279,
            ('basic', 'annual'): 999,
            ('premium', 'monthly'): 199,
            ('premium', 'quarterly'): 549,
            ('premium', 'annual'): 1999,
            ('professional', 'monthly'): 399,
            ('professional', 'quarterly'): 1099,
            ('professional', 'annual'): 3999,
        }
        
        amount = None
        if amount_override not in [None, '']:
            try:
                amount = Decimal(str(amount_override))
            except Exception:
                return Response(
                    {'detail': 'Invalid amount provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            amount = prices.get((plan, duration))

        if amount is None or amount <= 0:
            return Response(
                {'detail': 'Invalid subscription plan or duration'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate end date based on duration
        duration_map = {
            'monthly': timedelta(days=30),
            'quarterly': timedelta(days=90),
            'annual': timedelta(days=365),
        }

        if duration not in duration_map:
            return Response(
                {'detail': f'Unsupported subscription duration: {duration}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        end_date = timezone.now() + duration_map[duration]
        
        # Define features for each plan
        features_map = {
            'basic': {
                'consultations_per_month': 5,
                'max_appointments': 10,
                'priority_support': False,
            },
            'premium': {
                'consultations_per_month': 20,
                'max_appointments': 50,
                'priority_support': True,
            },
            'professional': {
                'consultations_per_month': 100,
                'max_appointments': 200,
                'priority_support': True,
                'admin_tools': True,
            },
        }
        
        # Create subscription
        try:
            subscription = Subscription.objects.create(
                user=request.user,
                plan=plan,
                duration=duration,
                amount=amount,
                end_date=end_date,
                status='inactive',
                features=features_map.get(plan, {})
            )
        except IntegrityError:
            return Response(
                {'detail': 'Unable to create subscription. A subscription may already exist for this user.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'subscription_id': subscription.id,
            'subscription': SubscriptionSerializer(subscription).data,
            'amount': str(subscription.amount),
            'plan': plan,
            'duration': duration,
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def start_trial(self, request):
        """Grant a one-time free trial (3 days) to a hospital_admin or pharmacy_admin user."""
        user = request.user

        # Only hospital_admin or pharmacy_admin can request a trial
        if not (('hospital_admin' in user.roles) or ('pharmacy_admin' in user.roles)):
            return Response({'detail': 'Only hospital or pharmacy admins can request a trial.'}, status=status.HTTP_403_FORBIDDEN)

        # Check if user already received a trial
        existing = Subscription.objects.filter(user=user, is_trial=True).exists()
        if existing:
            if not getattr(user, 'has_made_first_payment', False):
                user.has_made_first_payment = True
                user.save(update_fields=['has_made_first_payment'])
            return Response({'detail': 'Free trial already used for this account.'}, status=status.HTTP_400_BAD_REQUEST)

        # Determine associated hospital and pharmacy
        hospital = getattr(user, 'hospital_admin', None)
        pharmacy = getattr(user, 'pharmacy_admin', None)

        # Create 3-day free trial subscription
        trial_days = 3
        start_date = timezone.now()
        end_date = start_date + timedelta(days=trial_days)

        subscription = Subscription.objects.create(
            user=user,
            plan='basic',
            duration='monthly',
            amount=0,
            status='active',
            end_date=end_date,
            features={'trial': True, 'trial_days': trial_days},
            is_trial=True
        )

        # Keep the legacy flag in sync for older UI conditions.
        if not getattr(user, 'has_made_first_payment', False):
            user.has_made_first_payment = True
            user.save(update_fields=['has_made_first_payment'])

        # Return subscription and associated hospital/pharmacy info
        hospital_info = None
        pharmacy_info = None
        if hospital:
            hospital_info = {
                'id': hospital.id,
                'name': hospital.name,
                'phone_primary': getattr(hospital, 'phone_primary', None),
                'address': getattr(hospital, 'address', None)
            }
        if pharmacy:
            pharmacy_info = {
                'id': pharmacy.id,
                'name': pharmacy.name,
                'phone_number': getattr(pharmacy, 'phone_number', None),
                'address': getattr(pharmacy, 'address', None)
            }

        return Response({
            'detail': 'Free trial granted',
            'subscription': SubscriptionSerializer(subscription).data,
            'hospital': hospital_info,
            'pharmacy': pharmacy_info
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_subscriptions(self, request):
        """Get all subscriptions for current user"""
        subscriptions = self.get_queryset()
        serializer = SubscriptionListSerializer(subscriptions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def active_subscription(self, request):
        """Get current active subscription"""
        subscription = self.get_queryset().filter(status='active', end_date__gt=timezone.now()).first()
        if subscription:
            serializer = SubscriptionSerializer(subscription)
            return Response(serializer.data)
        return Response({'detail': 'No active subscription'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        """Cancel a subscription"""
        subscription = self.get_object()
        
        if subscription.user != request.user:
            return Response(
                {'detail': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        subscription.status = 'cancelled'
        subscription.save()
        
        return Response({
            'detail': 'Subscription cancelled successfully',
            'end_date': subscription.end_date
        })


class PaymentIntentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentIntentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
    
    def get_queryset(self):
        user = self.request.user
        return PaymentIntent.objects.filter(payment__user=user)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def check_status(self, request):
        """Check payment status using session token"""
        session_token = request.query_params.get('session_token')
        
        if not session_token:
            return Response(
                {'detail': 'session_token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            intent = PaymentIntent.objects.get(session_token=session_token)
        except PaymentIntent.DoesNotExist:
            return Response(
                {'detail': 'Payment intent not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if expired
        if intent.is_expired():
            return Response({
                'status': 'expired',
                'detail': 'Payment session has expired',
                'expires_at': intent.expires_at
            })
        
        serializer = PaymentIntentSerializer(intent)
        return Response(serializer.data)
