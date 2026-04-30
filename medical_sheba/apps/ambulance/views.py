from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import AmbulanceService, AmbulanceRequest
from .serializers import (
    AmbulanceServiceListSerializer, AmbulanceServiceDetailSerializer,
    AmbulanceRequestListSerializer, AmbulanceRequestDetailSerializer,
    AmbulanceRequestCreateSerializer
)


class AmbulanceServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AmbulanceService.objects.filter(is_available=True)
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vehicle_type', 'district', 'is_available']
    search_fields = ['name', 'driver_name', 'phone_number', 'district__name']
    ordering_fields = ['rating', 'cost_per_km']
    ordering = ['-is_verified', '-rating']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AmbulanceServiceDetailSerializer
        return AmbulanceServiceListSerializer
    
    @action(detail=False, methods=['get'])
    def by_district(self, request):
        """Filter ambulances by district"""
        district_id = request.query_params.get('district_id')
        if not district_id:
            return Response({'error': 'district_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        ambulances = self.queryset.filter(district_id=district_id)
        serializer = self.get_serializer(ambulances, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_vehicle_type(self, request):
        """Filter ambulances by vehicle type"""
        vehicle_type = request.query_params.get('type')
        if not vehicle_type:
            return Response({'error': 'type is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        ambulances = self.queryset.filter(vehicle_type=vehicle_type)
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
        return AmbulanceRequest.objects.all()
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept ambulance request (assign ambulance)"""
        ambulance_request = self.get_object()
        ambulance_id = request.data.get('ambulance_id')
        
        if not ambulance_id:
            return Response({'error': 'ambulance_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            ambulance = AmbulanceService.objects.get(id=ambulance_id)
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
        if ambulance_request.status in ['completed', 'cancelled']:
            return Response(
                {'error': f'Cannot cancel request with status {ambulance_request.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ambulance_request.status = 'cancelled'
        ambulance_request.save()
        
        serializer = self.get_serializer(ambulance_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update ambulance request status"""
        ambulance_request = self.get_object()
        new_status = request.data.get('status')
        
        valid_statuses = [choice[0] for choice in AmbulanceRequest.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'error': f'Invalid status. Valid options: {valid_statuses}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        ambulance_request.status = new_status
        ambulance_request.save()
        
        serializer = self.get_serializer(ambulance_request)
        return Response(serializer.data)
