from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from django_filters.rest_framework import DjangoFilterBackend
from django.core.files.base import ContentFile
from django.conf import settings
from PIL import Image
import os
import uuid
from io import BytesIO
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
    ordering = ['-created_at', '-rating']
    
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
    
    def create(self, request, *args, **kwargs):
        """Custom create method to assign hospital to current admin user"""
        # Only hospital admins can create hospitals
        if 'hospital_admin' not in request.user.roles:
            return Response(
                {'error': 'Only hospital admins can create hospitals'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if user already has a hospital
        if Hospital.objects.filter(admin_user=request.user).exists():
            return Response(
                {'error': 'You already have a hospital assigned. Only one hospital per admin is allowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add default coordinates if not provided
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        if 'latitude' not in data or data.get('latitude') is None:
            data['latitude'] = 23.8103  # Default to Dhaka
        if 'longitude' not in data or data.get('longitude') is None:
            data['longitude'] = 90.4125  # Default to Dhaka
        
        # Create hospital with admin_user set to current user
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Set admin_user to current user
        hospital_data = serializer.validated_data
        hospital_data['admin_user'] = request.user
        
        hospital = Hospital.objects.create(**hospital_data)
        
        output_serializer = self.get_serializer(hospital)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
    
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
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def upload_image(self, request):
        """Upload and convert image to WebP format"""
        if 'image' not in request.FILES:
            return Response(
                {'error': 'No image file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image_file = request.FILES['image']
        
        try:
            # Open the image with PIL
            img = Image.open(image_file)
            
            # Convert RGBA to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = rgb_img
            
            # Create media directory if it doesn't exist
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads', 'images')
            os.makedirs(upload_dir, exist_ok=True)
            
            # Generate unique filename
            filename = f"{uuid.uuid4()}.webp"
            filepath = os.path.join(upload_dir, filename)
            
            # Save as WebP
            img.save(filepath, 'WEBP', quality=85)
            
            # Return relative URL
            image_url = f"/media/uploads/images/{filename}"
            
            return Response({
                'image_url': image_url,
                'message': 'Image uploaded and converted to WebP successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to process image: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
