from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, BasePermission
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from apps.hospitals.models import Hospital
from .models import Doctor, DoctorReview
from .serializers import DoctorSerializer, DoctorListSerializer, DoctorReviewSerializer


class IsHospitalAdminOrReadOnly(BasePermission):
    """Allow hospital admins to manage their hospital's doctors, others can only read"""
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user and request.user.is_authenticated and (
            request.user.is_superuser or 'hospital_admin' in request.user.roles
        )
    
    def has_object_permission(self, request, view, obj):
        # Read permission for any request
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        # Write permission only for hospital admin of that doctor's hospital
        if request.user.is_authenticated and request.user.is_superuser:
            return True
        if request.user.is_authenticated and 'hospital_admin' in getattr(request.user, 'roles', []) and obj.hospital:
            return obj.hospital.admin_user == request.user
        return False


class IsPatientForReviewWrite(BasePermission):
    """Only patient accounts can create or manage doctor reviews."""
    patient_blocked_roles = {'pharmacy_admin', 'hospital_admin', 'ambulance_driver_admin', 'doctor', 'admin'}

    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        roles = set(getattr(request.user, 'roles', []) or [])
        return 'patient' in roles and not roles.intersection(self.patient_blocked_roles)

    def has_object_permission(self, request, view, obj):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return obj.patient == request.user


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.filter(is_available=True)
    serializer_class = DoctorSerializer
    permission_classes = [IsHospitalAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['specialty', 'is_verified', 'is_available', 'hospital']
    search_fields = ['user__first_name', 'user__last_name', 'specialty', 'bmdc_number']
    ordering_fields = ['rating', 'consultation_fee', 'experience_years']
    ordering = ['-rating']
    
    def get_queryset(self):
        user = self.request.user
        # Hospital admins only see doctors from their hospital
        if user.is_authenticated and user.is_superuser:
            return Doctor.objects.all()
        if user.is_authenticated and 'hospital_admin' in user.roles:
            try:
                hospital = Hospital.objects.get(admin_user=user)
                return Doctor.objects.filter(hospital=hospital)
            except Hospital.DoesNotExist:
                return Doctor.objects.none()
        # Others see all available doctors
        return Doctor.objects.filter(is_available=True)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DoctorListSerializer
        return DoctorSerializer
    
    @action(detail=False, methods=['get'])
    def my_doctors(self, request):
        """Get doctors for hospital admin's hospital"""
        if not request.user.is_authenticated or (
            not request.user.is_superuser and 'hospital_admin' not in getattr(request.user, 'roles', [])
        ):
            return Response(
                {'error': 'Only hospital admins can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            if request.user.is_superuser:
                doctors = Doctor.objects.all()
            else:
                hospital = Hospital.objects.get(admin_user=request.user)
                doctors = Doctor.objects.filter(hospital=hospital)
            serializer = DoctorSerializer(doctors, many=True)
            return Response(serializer.data)
        except Hospital.DoesNotExist:
            return Response(
                {'error': 'No hospital found for this admin'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def by_specialty(self, request):
        """Get doctors by specialty"""
        specialty = request.query_params.get('specialty')
        if not specialty:
            return Response(
                {'detail': 'specialty parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        doctors = self.get_queryset().filter(specialty__icontains=specialty)
        serializer = DoctorListSerializer(doctors, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_hospital(self, request):
        """Get doctors by hospital"""
        hospital_id = request.query_params.get('hospital_id')
        if not hospital_id:
            return Response(
                {'detail': 'hospital_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        doctors = self.get_queryset().filter(hospital_id=hospital_id)
        serializer = DoctorListSerializer(doctors, many=True)
        return Response(serializer.data)


class DoctorReviewViewSet(viewsets.ModelViewSet):
    queryset = DoctorReview.objects.all()
    serializer_class = DoctorReviewSerializer
    permission_classes = [IsPatientForReviewWrite]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['doctor', 'rating', 'is_verified_patient']
    ordering_fields = ['rating', 'helpful_count', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        doctor_id = self.request.query_params.get('doctor')
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        return queryset
    
    def perform_create(self, serializer):
        doctor = Doctor.objects.get(id=serializer.validated_data['doctor_id'])
        review = serializer.save(patient=self.request.user, doctor=doctor)
        
        # Update doctor's average rating and review count
        reviews = DoctorReview.objects.filter(doctor=doctor)
        avg_rating = reviews.aggregate(models.Avg('rating'))['rating__avg'] or 0
        doctor.rating = round(avg_rating, 2)
        doctor.review_count = reviews.count()
        doctor.save()
    
    @action(detail=False, methods=['get'])
    def doctor_reviews(self, request):
        """Get all reviews for a specific doctor"""
        doctor_id = request.query_params.get('doctor_id')
        if not doctor_id:
            return Response(
                {'detail': 'doctor_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        reviews = DoctorReview.objects.filter(doctor_id=doctor_id).order_by('-created_at')
        serializer = self.get_serializer(reviews, many=True)
        return Response({
            'count': reviews.count(),
            'results': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        """Mark a review as helpful"""
        review = self.get_object()
        review.helpful_count += 1
        review.save()
        return Response({'helpful_count': review.helpful_count})
