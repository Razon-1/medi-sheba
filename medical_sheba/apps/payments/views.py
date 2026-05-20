from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from django.core.mail import EmailMessage
from django.http import HttpResponse, HttpResponseRedirect
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import IntegrityError
from datetime import timedelta
from decimal import Decimal
import uuid
import secrets
import requests

from .models import Payment, Subscription, PaymentIntent
from .serializers import (
    PaymentSerializer, PaymentListSerializer, PaymentInitiateSerializer,
    PaymentVerifySerializer, SubscriptionSerializer, SubscriptionListSerializer,
    PaymentIntentSerializer
)
from apps.hospitals.models import Hospital
from apps.doctors.models import Doctor
from apps.edoctor.models import EDoctorProfile
from apps.ambulance.models import AmbulanceRequest
from apps.emedicine.models import EMedicineOrder, EMedicinePharmacy


def _frontend_url(path=''):
    base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
    return f"{base_url}{path}"


def _absolute_api_url(path):
    api_base_url = getattr(settings, 'API_BASE_URL', None)
    if api_base_url:
        return f"{api_base_url.rstrip('/')}{path}"
    return f"http://localhost:8000{path}"


def _payment_report_lines(payment):
    paid_at = payment.paid_at or payment.updated_at
    return [
        ('Payment Report', ''),
        ('Transaction ID', payment.transaction_id),
        ('Status', payment.get_status_display()),
        ('Payment Type', payment.get_payment_type_display()),
        ('Gateway', payment.get_gateway_display()),
        ('Amount', f"{payment.amount} {payment.currency}"),
        ('Gateway Reference', payment.gateway_reference or 'N/A'),
        ('Customer', f"{payment.user.get_full_name() or payment.user.email}"),
        ('Customer Email', payment.user.email),
        ('Reference Type', payment.reference_type or 'N/A'),
        ('Reference ID', payment.reference_id or 'N/A'),
        ('Created At', timezone.localtime(payment.created_at).strftime('%Y-%m-%d %H:%M:%S')),
        ('Paid At', timezone.localtime(paid_at).strftime('%Y-%m-%d %H:%M:%S') if paid_at else 'N/A'),
    ]


def _payment_report_text(payment):
    lines = _payment_report_lines(payment)
    width = max(len(label) for label, _ in lines if label)
    output = ['Medi Sheba Payment Report', '=' * 28, '']
    for label, value in lines[1:]:
        output.append(f"{label.ljust(width)} : {value}")
    output.append('')
    output.append('This is a system-generated payment report.')
    return '\n'.join(output)


def _escape_pdf_text(value):
    return str(value).replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


def _payment_report_pdf(payment):
    text_lines = _payment_report_text(payment).splitlines()
    stream_lines = ['BT', '/F1 12 Tf', '50 790 Td', '16 TL']
    for index, line in enumerate(text_lines):
        if index:
            stream_lines.append('T*')
        stream_lines.append(f"({_escape_pdf_text(line)}) Tj")
    stream_lines.append('ET')
    stream = '\n'.join(stream_lines).encode('latin-1', errors='replace')

    objects = [
        b'<< /Type /Catalog /Pages 2 0 R >>',
        b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
        b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        b'<< /Length ' + str(len(stream)).encode('ascii') + b' >>\nstream\n' + stream + b'\nendstream',
    ]

    pdf = bytearray(b'%PDF-1.4\n')
    offsets = [0]
    for number, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f'{number} 0 obj\n'.encode('ascii'))
        pdf.extend(obj)
        pdf.extend(b'\nendobj\n')
    xref_position = len(pdf)
    pdf.extend(f'xref\n0 {len(objects) + 1}\n'.encode('ascii'))
    pdf.extend(b'0000000000 65535 f \n')
    for offset in offsets[1:]:
        pdf.extend(f'{offset:010d} 00000 n \n'.encode('ascii'))
    pdf.extend(
        f'trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_position}\n%%EOF\n'.encode('ascii')
    )
    return bytes(pdf)


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
        if user.is_superuser or (hasattr(user, 'role') and user.role == 'admin'):
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

    @action(detail=False, methods=['post'], url_path='sslcommerz/initiate', permission_classes=[IsAuthenticated])
    def sslcommerz_initiate(self, request):
        """Create a payment and redirect user to SSLCommerz hosted checkout."""
        serializer = PaymentInitiateSerializer(data={**request.data, 'gateway': 'sslcommerz'})
        serializer.is_valid(raise_exception=True)

        transaction_id = f"TXN-{request.user.id}-{timezone.now().timestamp()}-{uuid.uuid4().hex[:8]}"
        payment_type = serializer.validated_data.get('payment_type')
        reference_id = serializer.validated_data.get('reference_id')
        hospital = self._get_hospital_for_service(payment_type=payment_type, reference_id=reference_id)
        pharmacy = self._get_pharmacy_for_service(payment_type=payment_type, reference_id=reference_id)

        payment = Payment.objects.create(
            user=request.user,
            transaction_id=transaction_id,
            status='pending',
            hospital=hospital,
            hospital_payment_number=hospital.phone_primary if hospital else None,
            pharmacy=pharmacy,
            pharmacy_payment_number=pharmacy.phone_number if pharmacy else None,
            **serializer.validated_data,
        )

        session_token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(minutes=30)
        PaymentIntent.objects.create(
            payment=payment,
            session_token=session_token,
            status='pending',
            expires_at=expires_at,
            metadata={
                'reference_id': payment.reference_id,
                'reference_type': payment.reference_type,
                'amount': str(payment.amount),
                'gateway': 'sslcommerz',
            },
        )

        user = request.user
        customer_name = user.get_full_name() or user.email or 'Medi Sheba Patient'
        customer_email = user.email or 'patient@medisheba.local'
        customer_phone = getattr(user, 'phone', None) or '01700000000'
        customer_address = getattr(user, 'address', None) or 'Bangladesh'
        customer_city = getattr(user, 'district', None) or 'Dhaka'

        if payment_type == 'edoctor' and reference_id:
            try:
                from apps.edoctor.models import EDoctorConsultation

                consultation = EDoctorConsultation.objects.get(id=reference_id)
                customer_name = consultation.patient_name or customer_name
                customer_email = consultation.patient_email or customer_email
                customer_phone = consultation.patient_phone or customer_phone
            except EDoctorConsultation.DoesNotExist:
                pass

        config = self._sslcommerz_config()
        payload = {
            'store_id': config['store_id'],
            'store_passwd': config['store_passwd'],
            'total_amount': str(payment.amount),
            'currency': payment.currency,
            'tran_id': payment.transaction_id,
            'success_url': _absolute_api_url('/api/payments/payments/sslcommerz/success/'),
            'fail_url': _absolute_api_url('/api/payments/payments/sslcommerz/fail/'),
            'cancel_url': _absolute_api_url('/api/payments/payments/sslcommerz/cancel/'),
            'ipn_url': _absolute_api_url('/api/payments/payments/sslcommerz/ipn/'),
            'cus_name': customer_name,
            'cus_email': customer_email,
            'cus_add1': customer_address,
            'cus_city': customer_city,
            'cus_country': 'Bangladesh',
            'cus_phone': customer_phone,
            'shipping_method': 'NO',
            'product_name': payment.get_payment_type_display(),
            'product_category': payment.payment_type,
            'product_profile': 'general',
        }

        try:
            response = requests.post(config['init_url'], data=payload, timeout=30)
            response_data = response.json()
        except (requests.RequestException, ValueError) as exc:
            payment.status = 'failed'
            payment.gateway_response = {'error': str(exc)}
            payment.save(update_fields=['status', 'gateway_response', 'updated_at'])
            return Response(
                {'detail': 'Unable to connect to SSLCommerz. Please try again.', 'error': str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        gateway_url = response_data.get('GatewayPageURL') or response_data.get('redirectGatewayURL')
        payment.gateway_response = response_data
        payment.save(update_fields=['gateway_response', 'updated_at'])

        if not gateway_url:
            payment.status = 'failed'
            payment.save(update_fields=['status', 'updated_at'])
            return Response(
                {'detail': response_data.get('failedreason') or 'SSLCommerz did not return a checkout URL.', 'gateway_response': response_data},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            'payment_id': payment.id,
            'transaction_id': payment.transaction_id,
            'session_token': session_token,
            'gateway_url': gateway_url,
            'amount': payment.amount,
            'currency': payment.currency,
            'status': payment.status,
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get', 'post'], url_path='sslcommerz/success', permission_classes=[AllowAny])
    def sslcommerz_success(self, request):
        payload = request.data.dict() if hasattr(request.data, 'dict') else dict(request.data)
        payload.update(request.query_params.dict())
        transaction_id = payload.get('tran_id')
        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
        except Payment.DoesNotExist:
            return HttpResponseRedirect(_frontend_url('/payment/failed?reason=payment-not-found'))

        is_valid, validation_payload = self._validate_sslcommerz_payment(payment, payload)
        if is_valid:
            self._mark_sslcommerz_success(payment, validation_payload)
            return HttpResponseRedirect(_frontend_url(f'/payment/success?transaction_id={payment.transaction_id}'))

        payment.status = 'failed'
        payment.gateway_response = validation_payload
        payment.save(update_fields=['status', 'gateway_response', 'updated_at'])
        return HttpResponseRedirect(_frontend_url(f'/payment/failed?transaction_id={payment.transaction_id}'))

    @action(detail=False, methods=['get', 'post'], url_path='sslcommerz/fail', permission_classes=[AllowAny])
    def sslcommerz_fail(self, request):
        transaction_id = request.data.get('tran_id') or request.query_params.get('tran_id')
        if transaction_id:
            Payment.objects.filter(transaction_id=transaction_id).update(status='failed', updated_at=timezone.now())
        return HttpResponseRedirect(_frontend_url(f'/payment/failed?transaction_id={transaction_id or ""}'))

    @action(detail=False, methods=['get', 'post'], url_path='sslcommerz/cancel', permission_classes=[AllowAny])
    def sslcommerz_cancel(self, request):
        transaction_id = request.data.get('tran_id') or request.query_params.get('tran_id')
        if transaction_id:
            Payment.objects.filter(transaction_id=transaction_id).update(status='cancelled', updated_at=timezone.now())
        return HttpResponseRedirect(_frontend_url(f'/payment/failed?cancelled=true&transaction_id={transaction_id or ""}'))

    @action(detail=False, methods=['post'], url_path='sslcommerz/ipn', permission_classes=[AllowAny])
    def sslcommerz_ipn(self, request):
        payload = request.data.dict() if hasattr(request.data, 'dict') else dict(request.data)
        transaction_id = payload.get('tran_id')
        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

        is_valid, validation_payload = self._validate_sslcommerz_payment(payment, payload)
        if is_valid:
            self._mark_sslcommerz_success(payment, validation_payload)
            return Response({'detail': 'Payment marked successful'})

        payment.gateway_response = validation_payload
        payment.save(update_fields=['gateway_response', 'updated_at'])
        return Response({'detail': 'IPN received but payment is not valid'}, status=status.HTTP_400_BAD_REQUEST)
    
    def _get_hospital_for_service(self, payment_type, reference_id):
        """Get hospital based on payment type and reference_id"""
        try:
            if payment_type == 'appointment' and reference_id:
                from apps.appointments.models import Appointment

                try:
                    appointment = Appointment.objects.select_related(
                        'hospital',
                        'doctor__hospital',
                    ).get(id=reference_id)
                    return appointment.hospital or (appointment.doctor.hospital if appointment.doctor else None)
                except Appointment.DoesNotExist:
                    # Backward compatibility for older callers that passed doctor id.
                    doctor = Doctor.objects.get(id=reference_id)
                    return doctor.hospital
            
            elif payment_type == 'edoctor' and reference_id:
                from apps.edoctor.models import EDoctorConsultation

                try:
                    consultation = EDoctorConsultation.objects.select_related('doctor__hospital').get(id=reference_id)
                    return consultation.doctor.hospital if consultation.doctor else None
                except EDoctorConsultation.DoesNotExist:
                    # Backward compatibility for older callers that passed e-doctor profile id.
                    edoctor = EDoctorProfile.objects.get(id=reference_id)
                    return edoctor.hospital
            
            elif payment_type == 'ambulance' and reference_id:
                ambulance_request = AmbulanceRequest.objects.select_related('ambulance__hospital').get(id=reference_id)
                return ambulance_request.ambulance.hospital if ambulance_request.ambulance else None
            
            elif payment_type == 'subscription':
                # Subscription doesn't belong to a specific hospital
                # Use user's primary hospital if available, otherwise None
                if hasattr(self.request.user, 'hospital_admin'):
                    return self.request.user.hospital_admin
                return None
            
            return None
        except (Doctor.DoesNotExist, EDoctorProfile.DoesNotExist, AmbulanceRequest.DoesNotExist):
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
            'sslcommerz': {
                'description': 'Pay securely with SSLCommerz',
                'note': f'Complete hosted checkout for {payment.amount} BDT'
            },
        }
        return instructions.get(payment.gateway, {})

    def _sslcommerz_config(self):
        sandbox = getattr(settings, 'SSLCOMMERZ_SANDBOX', True)
        store_id = (getattr(settings, 'SSLCOMMERZ_STORE_ID', '') or '').strip() or 'testbox'
        store_passwd = (getattr(settings, 'SSLCOMMERZ_STORE_PASSWORD', '') or '').strip() or 'qwerty'
        return {
            'store_id': store_id,
            'store_passwd': store_passwd,
            'init_url': getattr(
                settings,
                'SSLCOMMERZ_INIT_URL',
                'https://sandbox.sslcommerz.com/gwprocess/v4/api.php' if sandbox else 'https://securepay.sslcommerz.com/gwprocess/v4/api.php',
            ),
            'validation_url': getattr(
                settings,
                'SSLCOMMERZ_VALIDATION_URL',
                'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php' if sandbox else 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php',
            ),
        }

    def _mark_sslcommerz_success(self, payment, payload):
        if payment.status == 'success':
            return payment

        payment.status = 'success'
        payment.gateway = 'sslcommerz'
        payment.gateway_reference = (
            payload.get('bank_tran_id')
            or payload.get('val_id')
            or payload.get('tran_id')
            or payment.gateway_reference
        )
        payment.gateway_response = payload
        payment.paid_at = timezone.now()
        payment.save()

        user = payment.user
        if not getattr(user, 'has_made_first_payment', False):
            user.has_made_first_payment = True
            user.save(update_fields=['has_made_first_payment'])

        if hasattr(payment, 'intent'):
            payment.intent.status = 'completed'
            payment.intent.last_verification_at = timezone.now()
            payment.intent.save()

        self._handle_payment_success(payment)
        self._send_payment_report_email(payment, fail_silently=True)
        return payment

    def _validate_sslcommerz_payment(self, payment, payload):
        status_value = str(payload.get('status', '')).upper()
        if status_value in {'VALID', 'VALIDATED'}:
            return True, payload

        val_id = payload.get('val_id')
        if not val_id:
            return False, payload

        config = self._sslcommerz_config()
        try:
            response = requests.get(
                config['validation_url'],
                params={
                    'val_id': val_id,
                    'store_id': config['store_id'],
                    'store_passwd': config['store_passwd'],
                    'format': 'json',
                },
                timeout=20,
            )
            data = response.json()
        except (requests.RequestException, ValueError):
            return False, payload

        validation_status = str(data.get('status', '')).upper()
        amount_matches = str(data.get('tran_id') or payload.get('tran_id')) == payment.transaction_id
        return validation_status in {'VALID', 'VALIDATED'} and amount_matches, data

    def _send_payment_report_email(self, payment, fail_silently=False):
        if not payment.user.email:
            return False

        pdf_bytes = _payment_report_pdf(payment)
        subject = f'Medi Sheba payment report - {payment.transaction_id}'
        body = (
            f'Dear {payment.user.get_full_name() or payment.user.email},\n\n'
            'Your Medi Sheba payment report is attached.\n\n'
            f'Transaction ID: {payment.transaction_id}\n'
            f'Amount: {payment.amount} {payment.currency}\n'
            f'Status: {payment.get_status_display()}\n\n'
            'Thank you for using Medi Sheba.'
        )
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
            to=[payment.user.email],
        )
        email.attach(f'payment-report-{payment.transaction_id}.pdf', pdf_bytes, 'application/pdf')
        return email.send(fail_silently=fail_silently)
    
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
                if subscription.end_date <= timezone.now():
                    start_date = timezone.now()
                    if subscription.duration == 'yearly':
                        subscription.end_date = start_date + timedelta(days=365)
                    elif subscription.duration == 'quarterly':
                        subscription.end_date = start_date + timedelta(days=90)
                    else:
                        subscription.end_date = start_date + timedelta(days=30)
                subscription.save(update_fields=['payment', 'status', 'end_date', 'updated_at'])

                user = subscription.user
                if not getattr(user, 'has_made_first_payment', False):
                    user.has_made_first_payment = True
                    user.save(update_fields=['has_made_first_payment'])
            except Subscription.DoesNotExist:
                pass
    
    def _handle_appointment_payment(self, payment):
        """Update appointment payment status"""
        reference_type = payment.reference_type or payment.payment_type
        if payment.reference_id and reference_type in ['appointment', 'doctor_appointment']:
            try:
                from apps.appointments.models import Appointment
                appointment = Appointment.objects.get(id=payment.reference_id)
                appointment.payment = payment
                appointment.payment_status = 'paid'
                appointment.save(update_fields=['payment', 'payment_status', 'updated_at'])
            except Appointment.DoesNotExist:
                pass
    
    def _handle_edoctor_payment(self, payment):
        """Update e-doctor consultation payment status"""
        reference_type = payment.reference_type or payment.payment_type
        if payment.reference_id and reference_type in ['edoctor', 'edoctor_consultation', 'consultation']:
            try:
                from apps.edoctor.models import EDoctorConsultation
                consultation = EDoctorConsultation.objects.get(id=payment.reference_id)
                consultation.payment = payment
                consultation.payment_status = 'paid'
                consultation.is_paid = True
                consultation.save(update_fields=['payment', 'payment_status', 'is_paid', 'updated_at'])
            except EDoctorConsultation.DoesNotExist:
                pass
    
    def _handle_ambulance_payment(self, payment):
        """Update ambulance request payment status"""
        reference_type = payment.reference_type or payment.payment_type
        if payment.reference_id and reference_type in ['ambulance', 'ambulance_request']:
            try:
                request_obj = AmbulanceRequest.objects.get(id=payment.reference_id)
                request_obj.payment = payment
                request_obj.payment_status = 'paid'
                request_obj.save(update_fields=['payment', 'payment_status', 'updated_at'])
            except AmbulanceRequest.DoesNotExist:
                pass
    
    def _handle_medicine_payment(self, payment):
        """Update medicine order payment status"""
        reference_type = payment.reference_type or payment.payment_type
        if payment.reference_id and reference_type in ['medicine', 'medicine_order']:
            try:
                order = EMedicineOrder.objects.get(id=payment.reference_id)
                order.payment = payment
                order.payment_status = 'paid'
                order.save(update_fields=['payment', 'payment_status', 'updated_at'])
            except EMedicineOrder.DoesNotExist:
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

    @action(detail=True, methods=['get'], url_path='download-report', permission_classes=[IsAuthenticated])
    def download_report(self, request, pk=None):
        """Download a PDF payment report/receipt."""
        payment = self.get_object()
        pdf_bytes = _payment_report_pdf(payment)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="payment-report-{payment.transaction_id}.pdf"'
        return response

    @action(detail=True, methods=['post'], url_path='email-report', permission_classes=[IsAuthenticated])
    def email_report(self, request, pk=None):
        """Email a PDF payment report/receipt to the paying user."""
        payment = self.get_object()
        sent = self._send_payment_report_email(payment, fail_silently=False)
        if sent:
            return Response({'detail': f'Payment report sent to {payment.user.email}'})
        return Response({'detail': 'Payment report email could not be sent'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='status-by-transaction', permission_classes=[AllowAny])
    def status_by_transaction(self, request):
        """Load payment receipt details after a gateway redirect."""
        transaction_id = request.query_params.get('transaction_id')
        if not transaction_id:
            return Response({'detail': 'transaction_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(PaymentListSerializer(payment).data)

    @action(detail=False, methods=['get'], url_path='download-report-by-transaction', permission_classes=[AllowAny])
    def download_report_by_transaction(self, request):
        """Download payment report using transaction id from the gateway redirect."""
        transaction_id = request.query_params.get('transaction_id')
        if not transaction_id:
            return Response({'detail': 'transaction_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

        pdf_bytes = _payment_report_pdf(payment)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="payment-report-{payment.transaction_id}.pdf"'
        return response

    @action(detail=False, methods=['post'], url_path='email-report-by-transaction', permission_classes=[AllowAny])
    def email_report_by_transaction(self, request):
        """Email payment report using transaction id from the gateway redirect."""
        transaction_id = request.data.get('transaction_id')
        if not transaction_id:
            return Response({'detail': 'transaction_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

        sent = self._send_payment_report_email(payment, fail_silently=False)
        if sent:
            return Response({'detail': f'Payment report sent to {payment.user.email}'})
        return Response({'detail': 'Payment report email could not be sent'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_payments(self, request):
        """Get all payments for current user"""
        payments = self.get_queryset()
        
        # Apply filters if provided
        status_filter = request.query_params.get('status')
        payment_type = request.query_params.get('payment_type')
        transaction_id = request.query_params.get('transaction_id')
        
        if status_filter:
            payments = payments.filter(status=status_filter)
        if payment_type:
            payments = payments.filter(payment_type=payment_type)
        if transaction_id:
            payments = payments.filter(transaction_id=transaction_id)
        
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
        if user.is_superuser or (hasattr(user, 'role') and user.role == 'admin'):
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
        """Grant a one-time free trial (3 days) to an admin user."""
        user = request.user

        # Only business admins can request a trial.
        if not ({'hospital_admin', 'pharmacy_admin', 'ambulance_driver_admin'} & set(user.roles)):
            return Response({'detail': 'Only hospital, pharmacy, or ambulance admins can request a trial.'}, status=status.HTTP_403_FORBIDDEN)

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
        
        if subscription.user != request.user and not request.user.is_superuser:
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
