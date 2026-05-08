from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from django_filters.rest_framework import DjangoFilterBackend
from .models import Hospital
from .serializers import HospitalSerializer, HospitalListSerializer


class IsHospitalAdmin(BasePermission):
    """Permission check for hospital admin"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and 'hospital_admin' in request.user.roles


class IsHospitalAdminOrReadOnly(BasePermission):
    """Allow hospital admins to manage their hospital, others can only read"""
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user and request.user.is_authenticated and 'hospital_admin' in request.user.roles
    
    def has_object_permission(self, request, view, obj):
        # Read permission for any request
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        # Write permission only for the hospital admin of that hospital
        return obj.admin_user == request.user


class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.filter(is_active=True)
    serializer_class = HospitalSerializer
    permission_classes = [IsHospitalAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'district', 'emergency_available', 'is_verified']
    search_fields = ['name', 'address', 'phone_primary']
    ordering_fields = ['rating', 'created_at', 'name']
    ordering = ['-rating']
    
    def get_queryset(self):
        user = self.request.user
        # Hospital admins only see their own hospital
        if user.is_authenticated and 'hospital_admin' in user.roles:
            return Hospital.objects.filter(admin_user=user)
        # Others see all active hospitals
        return Hospital.objects.filter(is_active=True)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return HospitalListSerializer
        return HospitalSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_hospital(self, request):
        """Get the current user's hospital (for hospital admin)"""
        if 'hospital_admin' not in request.user.roles:
            return Response(
                {'error': 'Only hospital admins can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            hospital = Hospital.objects.get(admin_user=request.user)
            serializer = HospitalSerializer(hospital)
            return Response(serializer.data)
        except Hospital.DoesNotExist:
            return Response(
                {'error': 'No hospital found for this admin'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def by_district(self, request):
        """Get hospitals by district"""
        district = request.query_params.get('district')
        if not district:
            return Response(
                {'detail': 'district parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        hospitals = self.get_queryset().filter(district=district)
        serializer = HospitalListSerializer(hospitals, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def emergency(self, request):
        """Get hospitals with 24/7 emergency service"""
        hospitals = self.get_queryset().filter(emergency_available=True)
        serializer = HospitalListSerializer(hospitals, many=True)
        return Response(serializer.data)
