from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.hospitals.models import Hospital
from .models import EDoctorProfile, ConsultationSlot, EDoctorConsultation
from .serializers import (
    EDoctorProfileListSerializer,
    EDoctorProfileDetailSerializer,
    EDoctorProfileWriteSerializer,
    ConsultationSlotSerializer,
    EDoctorConsultationListSerializer,
    EDoctorConsultationDetailSerializer,
    EDoctorConsultationCreateSerializer,
)


class IsHospitalAdminOrReadOnly(BasePermission):
    """Allow hospital admins to manage their hospital's e-doctors, others can only read"""
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user and request.user.is_authenticated and 'hospital_admin' in request.user.roles
    
    def has_object_permission(self, request, view, obj):
        # Read permission for any request
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        # Write permission only for hospital admin of that edoctor's hospital
        if request.user.is_authenticated and 'hospital_admin' in getattr(request.user, 'roles', []) and obj.hospital:
            return obj.hospital.admin_user == request.user
        return False


class EDoctorProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for doctor profiles with hospital admin management"""
    queryset = EDoctorProfile.objects.all()
    permission_classes = [IsHospitalAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['specialization', 'is_available', 'is_verified', 'hospital']
    search_fields = ['name', 'registration_number', 'phone_number', 'hospital_name', 'specialties']
    ordering_fields = ['is_verified', 'rating', 'experience_years', 'consultation_fee']
    ordering = ['-is_verified', '-rating']

    def get_queryset(self):
        user = self.request.user
        # Hospital admins only see e-doctors from their hospital
        if user.is_authenticated and 'hospital_admin' in user.roles:
            try:
                hospital = Hospital.objects.get(admin_user=user)
                return EDoctorProfile.objects.filter(hospital=hospital)
            except Hospital.DoesNotExist:
                return EDoctorProfile.objects.none()
        # Others see all available e-doctors
        return EDoctorProfile.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EDoctorProfileDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return EDoctorProfileWriteSerializer
        return EDoctorProfileListSerializer

    @action(detail=False, methods=['get'])
    def my_edoctors(self, request):
        """Get e-doctors for hospital admin's hospital"""
        if not request.user.is_authenticated or 'hospital_admin' not in getattr(request.user, 'roles', []):
            return Response(
                {'error': 'Only hospital admins can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            hospital = Hospital.objects.get(admin_user=request.user)
            edoctors = EDoctorProfile.objects.filter(hospital=hospital)
            serializer = EDoctorProfileListSerializer(edoctors, many=True)
            return Response(serializer.data)
        except Hospital.DoesNotExist:
            return Response(
                {'error': 'No hospital found for this admin'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def by_specialization(self, request):
        """Get doctors by specialization"""
        specialization = request.query_params.get('specialization')
        if not specialization:
            return Response(
                {'error': 'specialization parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        doctors = self.get_queryset().filter(
            specialization=specialization,
            is_available=True
        )
        serializer = self.get_serializer(doctors, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def verified_only(self, request):
        """Get only verified doctors"""
        doctors = EDoctorProfile.objects.filter(is_verified=True, is_available=True)
        serializer = self.get_serializer(doctors, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def top_rated(self, request):
        """Get top-rated doctors"""
        doctors = EDoctorProfile.objects.filter(
            is_available=True
        ).order_by('-rating')[:10]
        serializer = self.get_serializer(doctors, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def available_now(self, request):
        """Get currently available doctors"""
        from django.utils import timezone
        current_time = timezone.now().time()
        doctors = EDoctorProfile.objects.filter(
            is_available=True,
            available_start_time__lte=current_time,
            available_end_time__gte=current_time
        )
        serializer = self.get_serializer(doctors, many=True)
        return Response(serializer.data)


class ConsultationSlotViewSet(viewsets.ReadOnlyModelViewSet):
    """Consultation slots viewset"""
    queryset = ConsultationSlot.objects.filter(is_available=True)
    serializer_class = ConsultationSlotSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['doctor', 'status']
    ordering_fields = ['start_time']
    ordering = ['start_time']


class IsPatientOrReadOnly(BasePermission):
    """Allow patients to view/create their consultations, others can only read"""
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Read permission for any request
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        # Write permission only for the patient who booked the consultation
        return obj.patient_email == request.user.email if request.user.is_authenticated else False


class EDoctorConsultationViewSet(viewsets.ModelViewSet):
    """Consultation booking viewset"""
    queryset = EDoctorConsultation.objects.all()
    permission_classes = [IsPatientOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'urgency', 'doctor', 'is_paid']
    search_fields = ['patient_name', 'consultation_id', 'patient_phone']
    ordering_fields = ['scheduled_date', 'created_at', 'fee_amount']
    ordering = ['-scheduled_date']

    def get_queryset(self):
        user = self.request.user
        # Hospital admins see consultations for their e-doctors
        if user.is_authenticated and 'hospital_admin' in user.roles:
            try:
                hospital = Hospital.objects.get(admin_user=user)
                return EDoctorConsultation.objects.filter(doctor__hospital=hospital).order_by('-created_at')
            except Hospital.DoesNotExist:
                return EDoctorConsultation.objects.none()
        # Others see all consultations
        return EDoctorConsultation.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return EDoctorConsultationCreateSerializer
        elif self.action == 'retrieve':
            return EDoctorConsultationDetailSerializer
        return EDoctorConsultationListSerializer

    def perform_create(self, serializer):
        """Create consultation and set fee"""
        doctor = serializer.validated_data['doctor']
        serializer.save(fee_amount=doctor.consultation_fee)

    @action(detail=False, methods=['get'])
    def hospital_consultations(self, request):
        """Get all consultations for hospital admin's e-doctors"""
        if not request.user.is_authenticated or 'hospital_admin' not in getattr(request.user, 'roles', []):
            return Response(
                {'error': 'Only hospital admins can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            hospital = Hospital.objects.get(admin_user=request.user)
            consultations = EDoctorConsultation.objects.filter(doctor__hospital=hospital).order_by('-created_at')
            
            # Filter by status if provided
            status_filter = request.query_params.get('status')
            if status_filter:
                consultations = consultations.filter(status=status_filter)
            
            serializer = EDoctorConsultationListSerializer(consultations, many=True)
            return Response(serializer.data)
        except Hospital.DoesNotExist:
            return Response(
                {'error': 'No hospital found for this admin'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a consultation booking"""
        consultation = self.get_object()
        consultation.status = 'confirmed'
        consultation.save()
        serializer = EDoctorConsultationDetailSerializer(consultation)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a consultation"""
        consultation = self.get_object()
        if consultation.status in ['scheduled', 'confirmed']:
            consultation.status = 'cancelled'
            consultation.save()
            serializer = EDoctorConsultationDetailSerializer(consultation)
            return Response(serializer.data)
        return Response(
            {'error': 'Cannot cancel consultation in this status'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def start_consultation(self, request, pk=None):
        """Start the consultation"""
        consultation = self.get_object()
        if consultation.status == 'scheduled':
            consultation.status = 'ongoing'
            consultation.save()
            serializer = EDoctorConsultationDetailSerializer(consultation)
            return Response(serializer.data)
        return Response(
            {'error': 'Consultation cannot be started'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark consultation as completed"""
        consultation = self.get_object()
        if consultation.status == 'ongoing':
            consultation.status = 'completed'
            consultation.save()
            serializer = EDoctorConsultationDetailSerializer(consultation)
            return Response(serializer.data)
        return Response(
            {'error': 'Consultation is not ongoing'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['put', 'patch'])
    def add_notes(self, request, pk=None):
        """Add consultation notes and prescription"""
        consultation = self.get_object()
        consultation.consultation_notes = request.data.get('consultation_notes', consultation.consultation_notes)
        consultation.prescription = request.data.get('prescription', consultation.prescription)
        consultation.save()
        serializer = EDoctorConsultationDetailSerializer(consultation)
        return Response(serializer.data)
