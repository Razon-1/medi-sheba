from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, BasePermission
from django_filters.rest_framework import DjangoFilterBackend
from .models import Review
from .serializers import ReviewSerializer, ReviewListSerializer


class IsPatientForReviewWrite(BasePermission):
    """Only patient accounts can create or manage reviews."""
    patient_blocked_roles = {'pharmacy_admin', 'hospital_admin', 'doctor', 'admin'}

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
        return obj.reviewer == request.user


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(is_visible=True)
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['target_type', 'rating']
    search_fields = ['comment', 'reviewer__first_name']
    ordering_fields = ['rating', 'created_at']
    ordering = ['-created_at']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsPatientForReviewWrite()]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ReviewListSerializer
        return ReviewSerializer
    
    @action(detail=False, methods=['get'])
    def doctor_reviews(self, request):
        """Get reviews for a doctor"""
        doctor_id = request.query_params.get('doctor_id')
        if not doctor_id:
            return Response(
                {'detail': 'doctor_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        reviews = self.queryset.filter(target_type='doctor', target_id=doctor_id)
        serializer = ReviewListSerializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def hospital_reviews(self, request):
        """Get reviews for a hospital"""
        hospital_id = request.query_params.get('hospital_id')
        if not hospital_id:
            return Response(
                {'detail': 'hospital_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        reviews = self.queryset.filter(target_type='hospital', target_id=hospital_id)
        serializer = ReviewListSerializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def top_rated(self, request):
        """Get top rated reviews"""
        reviews = self.queryset.filter(rating__gte=4).order_by('-rating')[:10]
        serializer = ReviewListSerializer(reviews, many=True)
        return Response(serializer.data)
