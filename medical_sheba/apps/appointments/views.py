from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime, timedelta
from apps.hospitals.models import Hospital
from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentListSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'type', 'payment_status']
    search_fields = ['appointment_no', 'patient__email']
    ordering_fields = ['appointment_date', 'created_at']
    ordering = ['-appointment_date']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return user.appointments.all()
        elif user.role == 'doctor':
            return Appointment.objects.filter(doctor__user=user)
        elif 'hospital_admin' in user.roles:
            # Hospital admins see appointments for their hospital
            try:
                hospital = Hospital.objects.get(admin_user=user)
                return Appointment.objects.filter(hospital=hospital)
            except Hospital.DoesNotExist:
                return Appointment.objects.none()
        elif user.role == 'admin':
            return Appointment.objects.all()
        return Appointment.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AppointmentListSerializer
        return AppointmentSerializer
    
    def create(self, request, *args, **kwargs):
        """Create an appointment with automatic appointment number generation"""
        # Create a copy of request data to modify
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # Auto-assign patient if not provided
        if 'patient_id' not in data and request.user.is_authenticated:
            data['patient_id'] = request.user.id
        
        # Create serializer with modified data
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Ensure patient is set in validated data
        if 'patient' not in serializer.validated_data:
            serializer.validated_data['patient'] = request.user
        
        # Generate unique appointment number within 20 character limit
        from django.utils.timezone import now
        import random
        import string
        
        appointment_date = serializer.validated_data.get('appointment_date')
        now_obj = now()
        
        # Format: APT + YYMMDD + HHMM + 2 random digits
        # Total: 3 + 6 + 4 + 2 = 15 characters (well within 20 limit)
        date_str = now_obj.strftime('%y%m%d')  # YYMMDD - 6 chars
        time_str = now_obj.strftime('%H%M')     # HHMM - 4 chars
        random_suffix = ''.join(random.choices(string.digits, k=2))  # 2 random digits
        
        appointment_no = f"APT{date_str}{time_str}{random_suffix}"
        
        # Ensure unique appointment number
        counter = 0
        original_appointment_no = appointment_no
        while Appointment.objects.filter(appointment_no=appointment_no).exists() and counter < 100:
            random_suffix = ''.join(random.choices(string.digits, k=2))
            appointment_no = f"APT{date_str}{time_str}{random_suffix}"
            counter += 1
        
        serializer.validated_data['appointment_no'] = appointment_no
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False, methods=['get'])
    def my_appointments(self, request):
        """Get user's appointments"""
        appointments = self.get_queryset()
        serializer = AppointmentListSerializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming appointments"""
        today = datetime.now().date()
        appointments = self.get_queryset().filter(
            appointment_date__gte=today,
            status__in=['pending', 'confirmed']
        ).order_by('appointment_date')
        serializer = AppointmentListSerializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def hospital_appointments(self, request):
        """Get all appointments for hospital admin's hospital"""
        if not request.user.is_authenticated or 'hospital_admin' not in getattr(request.user, 'roles', []):
            return Response(
                {'error': 'Only hospital admins can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            hospital = Hospital.objects.get(admin_user=request.user)
            appointments = Appointment.objects.filter(hospital=hospital).order_by('-created_at')
            
            # Filter by status if provided
            status_filter = request.query_params.get('status')
            if status_filter:
                appointments = appointments.filter(status=status_filter)
            
            serializer = AppointmentListSerializer(appointments, many=True)
            return Response(serializer.data)
        except Hospital.DoesNotExist:
            return Response(
                {'error': 'No hospital found for this admin'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm an appointment (hospital admin or patient)"""
        appointment = self.get_object()
        
        # Check authorization
        is_hospital_admin = request.user.is_authenticated and 'hospital_admin' in getattr(request.user, 'roles', []) and appointment.hospital and appointment.hospital.admin_user == request.user
        is_patient = request.user.is_authenticated and appointment.patient == request.user
        
        if not (is_hospital_admin or is_patient):
            return Response(
                {'error': 'You do not have permission to confirm this appointment'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if appointment.status not in ['pending', 'confirmed']:
            return Response(
                {'error': f'Cannot confirm appointment with status {appointment.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'confirmed'
        
        # Hospital admin can set appointment date and time
        if is_hospital_admin:
            appointment_date = request.data.get('appointment_date')
            appointment_time = request.data.get('appointment_time')
            if appointment_date:
                appointment.appointment_date = appointment_date
            if appointment_time:
                appointment.appointment_time = appointment_time
        
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment"""
        appointment = self.get_object()
        if appointment.status == 'completed':
            return Response(
                {'detail': 'Cannot cancel completed appointment'},
                status=status.HTTP_400_BAD_REQUEST
            )
        appointment.status = 'cancelled'
        appointment.cancelled_by = request.user
        appointment.cancel_reason = request.data.get('reason', '')
        appointment.save()
        return Response({'detail': 'Appointment cancelled successfully'})
