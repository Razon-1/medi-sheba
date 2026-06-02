from rest_framework import viewsets, filters, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from decimal import Decimal, InvalidOperation
from .models import AmbulanceService, AmbulanceRequest
from .serializers import (
    AmbulanceServiceListSerializer, AmbulanceServiceDetailSerializer, 
    AmbulanceServiceCreateSerializer,
    AmbulanceRequestListSerializer, AmbulanceRequestDetailSerializer,
    AmbulanceRequestCreateSerializer
)


class IsAmbulanceAdminOrReadOnly(BasePermission):
    """Allow ambulance admins to manage their own ambulances."""
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        roles = getattr(request.user, 'roles', [])
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or 'ambulance_driver_admin' in roles)
        )
    
    def has_object_permission(self, request, view, obj):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        roles = getattr(request.user, 'roles', [])
        if request.user.is_authenticated and request.user.is_superuser:
            return True
        if request.user.is_authenticated and 'ambulance_driver_admin' in roles:
            return obj.admin_user == request.user
        return False


class AmbulanceServiceViewSet(viewsets.ModelViewSet):
    queryset = AmbulanceService.objects.filter(is_available=True)
    permission_classes = [IsAmbulanceAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vehicle_type', 'district', 'is_available', 'hospital']
    search_fields = ['name', 'driver_name', 'phone_number', 'district__name']
    ordering_fields = ['rating', 'cost_per_km']
    ordering = ['-is_verified', '-rating']
    
    def get_queryset(self):
        user = self.request.user
        roles = getattr(user, 'roles', [])

        # Ambulance admins only see their own ambulances.
        if user.is_authenticated and user.is_superuser:
            return AmbulanceService.objects.all()
        if user.is_authenticated and 'ambulance_driver_admin' in roles:
            return AmbulanceService.objects.filter(admin_user=user)

        # Others see all available ambulances.
        return AmbulanceService.objects.filter(is_available=True)
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AmbulanceServiceCreateSerializer
        elif self.action == 'retrieve':
            return AmbulanceServiceDetailSerializer
        return AmbulanceServiceListSerializer
    
    @action(detail=False, methods=['get'])
    def my_ambulances(self, request):
        """Get ambulances managed by the current ambulance admin."""
        roles = getattr(request.user, 'roles', [])
        if not request.user.is_authenticated or (
            not request.user.is_superuser and 'ambulance_driver_admin' not in roles
        ):
            return Response(
                {'error': 'Only ambulance admins can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        ambulances = AmbulanceService.objects.all() if request.user.is_superuser else AmbulanceService.objects.filter(admin_user=request.user)
        serializer = AmbulanceServiceListSerializer(ambulances, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        user = self.request.user
        roles = getattr(user, 'roles', [])

        if not user.is_superuser and not user.has_active_subscription_access():
            raise serializers.ValidationError(
                "Active subscription required. Please start a trial or purchase a plan before creating an ambulance service."
            )

        if user.is_superuser:
            serializer.save(hospital=None)
            return

        if 'ambulance_driver_admin' in roles:
            if AmbulanceService.objects.filter(admin_user=user).exists():
                raise serializers.ValidationError(
                    "You already added an ambulance. One ambulance driver admin can manage only one ambulance."
                )
            serializer.save(admin_user=user, hospital=None)
            return

        raise serializers.ValidationError("Only ambulance admins can create ambulances")

    def perform_update(self, serializer):
        user = self.request.user
        roles = getattr(user, 'roles', [])

        if user.is_superuser:
            serializer.save()
            return

        if 'ambulance_driver_admin' in roles:
            serializer.save(admin_user=user, hospital=None)
            return

        serializer.save()
    
    @action(detail=False, methods=['get'])
    def by_district(self, request):
        """Filter ambulances by district"""
        district_id = request.query_params.get('district_id')
        if not district_id:
            return Response({'error': 'district_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        ambulances = self.get_queryset().filter(district_id=district_id)
        serializer = self.get_serializer(ambulances, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_vehicle_type(self, request):
        """Filter ambulances by vehicle type"""
        vehicle_type = request.query_params.get('type')
        if not vehicle_type:
            return Response({'error': 'type is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        ambulances = self.get_queryset().filter(vehicle_type=vehicle_type)
        serializer = self.get_serializer(ambulances, many=True)
        return Response(serializer.data)


class AmbulanceRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'vehicle_type_required', 'urgency']
    search_fields = ['patient_name', 'request_id']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AmbulanceRequestCreateSerializer
        elif self.action == 'retrieve':
            return AmbulanceRequestDetailSerializer
        return AmbulanceRequestListSerializer
    
    def get_queryset(self):
        user = self.request.user
        roles = getattr(user, 'roles', [])

        # Ambulance admins see requests for their own ambulances.
        if user.is_authenticated and user.is_superuser:
            return AmbulanceRequest.objects.all().order_by('-created_at')
        if user.is_authenticated and 'ambulance_driver_admin' in roles:
            return AmbulanceRequest.objects.filter(ambulance__admin_user=user).order_by('-created_at')

        if user.is_authenticated:
            return AmbulanceRequest.objects.filter(
                Q(user=user) | Q(contact_phone=user.phone)
            ).distinct().order_by('-created_at')
        return AmbulanceRequest.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def _get_admin_requests_response(self, request):
        """Get all ambulance requests for the current ambulance admin."""
        roles = getattr(request.user, 'roles', [])
        if not request.user.is_authenticated or (
            not request.user.is_superuser and 'ambulance_driver_admin' not in roles
        ):
            return Response(
                {'error': 'Only ambulance admins can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        requests = AmbulanceRequest.objects.all().order_by('-created_at') if request.user.is_superuser else AmbulanceRequest.objects.filter(ambulance__admin_user=request.user).order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            requests = requests.filter(status=status_filter)
        serializer = AmbulanceRequestListSerializer(requests, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def admin_requests(self, request):
        """Get all ambulance requests for the current ambulance admin."""
        return self._get_admin_requests_response(request)

    @action(detail=False, methods=['get'])
    def hospital_requests(self, request):
        """Backward-compatible alias for ambulance admin requests."""
        return self._get_admin_requests_response(request)
    
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept ambulance request (assign ambulance)"""
        ambulance_request = self.get_object()
        ambulance_id = request.data.get('ambulance_id')
        
        if not ambulance_id:
            return Response({'error': 'ambulance_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            ambulance = AmbulanceService.objects.get(id=ambulance_id)
            roles = getattr(request.user, 'roles', [])
            if not request.user.is_superuser and 'ambulance_driver_admin' not in roles:
                return Response({'error': 'Only ambulance admins can accept ambulance requests'}, status=status.HTTP_403_FORBIDDEN)
            if not request.user.is_superuser and ambulance.admin_user != request.user:
                return Response({'error': 'You can only assign your own ambulance'}, status=status.HTTP_403_FORBIDDEN)

            ambulance_request.ambulance = ambulance
            ambulance_request.status = 'accepted'
            ambulance_request.save()
            
            serializer = self.get_serializer(ambulance_request)
            return Response(serializer.data)
        except AmbulanceService.DoesNotExist:
            return Response({'error': 'Ambulance not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel ambulance request"""
        ambulance_request = self.get_object()
        if ambulance_request.status != 'pending':
            return Response(
                {'error': 'Ambulance requests can be cancelled while pending only.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ambulance_request.status = 'cancelled'
        ambulance_request.save()
        
        serializer = self.get_serializer(ambulance_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_fare(self, request, pk=None):
        """Set trip distance and calculate final fare for an ambulance request."""
        ambulance_request = self.get_object()
        roles = getattr(request.user, 'roles', [])
        if not request.user.is_superuser and 'ambulance_driver_admin' not in roles:
            return Response(
                {'error': 'Only ambulance admins can update ambulance request fare'},
                status=status.HTTP_403_FORBIDDEN
            )
        if not request.user.is_superuser and (not ambulance_request.ambulance or ambulance_request.ambulance.admin_user != request.user):
            return Response(
                {'error': 'You can only update fare for your own ambulance requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        if ambulance_request.status in ['completed', 'cancelled']:
            return Response(
                {'error': 'Completed or cancelled ambulance requests cannot be updated.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        distance_value = request.data.get('distance_km')
        try:
            distance_km = Decimal(str(distance_value))
        except (InvalidOperation, TypeError):
            return Response({'error': 'Valid distance_km is required'}, status=status.HTTP_400_BAD_REQUEST)

        if distance_km <= 0:
            return Response({'error': 'Distance must be greater than 0 km'}, status=status.HTTP_400_BAD_REQUEST)

        ambulance_request.distance_km = distance_km
        # Final ambulance fare = trip distance in km * ambulance price per km.
        ambulance_request.final_fare = (distance_km * ambulance_request.ambulance.cost_per_km).quantize(Decimal('0.01'))
        ambulance_request.save(update_fields=['distance_km', 'final_fare', 'updated_at'])

        serializer = self.get_serializer(ambulance_request)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update ambulance request status"""
        ambulance_request = self.get_object()
        roles = getattr(request.user, 'roles', [])
        if not request.user.is_superuser and 'ambulance_driver_admin' not in roles:
            return Response(
                {'error': 'Only ambulance admins can update ambulance request status'},
                status=status.HTTP_403_FORBIDDEN
            )
        if not request.user.is_superuser and (not ambulance_request.ambulance or ambulance_request.ambulance.admin_user != request.user):
            return Response(
                {'error': 'You can only update requests for your own ambulance'},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get('status')
        
        valid_statuses = [choice[0] for choice in AmbulanceRequest.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'error': f'Invalid status. Valid options: {valid_statuses}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        if ambulance_request.status in ['completed', 'cancelled']:
            return Response(
                {'error': 'Completed or cancelled ambulance requests cannot be updated.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        update_fields = ['status', 'updated_at']
        ambulance_request.status = new_status
        if new_status == 'completed':
            ambulance_request.payment_status = 'paid'
            update_fields.append('payment_status')
        ambulance_request.save(update_fields=update_fields)
        
        serializer = self.get_serializer(ambulance_request)
        return Response(serializer.data)
