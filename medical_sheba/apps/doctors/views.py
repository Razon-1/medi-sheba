from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from .models import Doctor, DoctorReview
from .serializers import DoctorSerializer, DoctorListSerializer, DoctorReviewSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.filter(is_available=True)
    serializer_class = DoctorSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['specialty', 'is_verified', 'is_available']
    search_fields = ['user__first_name', 'user__last_name', 'specialty', 'bmdc_number']
    ordering_fields = ['rating', 'consultation_fee', 'experience_years']
    ordering = ['-rating']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DoctorListSerializer
        return DoctorSerializer
    
    @action(detail=False, methods=['get'])
    def by_specialty(self, request):
        """Get doctors by specialty"""
        specialty = request.query_params.get('specialty')
        if not specialty:
            return Response(
                {'detail': 'specialty parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        doctors = self.queryset.filter(specialty__icontains=specialty)
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
        doctors = self.queryset.filter(hospital_id=hospital_id)
        serializer = DoctorListSerializer(doctors, many=True)
        return Response(serializer.data)


class DoctorReviewViewSet(viewsets.ModelViewSet):
    queryset = DoctorReview.objects.all()
    serializer_class = DoctorReviewSerializer
    permission_classes = [AllowAny]
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
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
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
