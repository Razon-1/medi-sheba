from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import EMedicinePharmacy, MedicineItem, EMedicineOrder
from .serializers import (
    EMedicinePharmacyListSerializer,
    EMedicinePharmacyDetailSerializer,
    EMedicineOrderListSerializer,
    EMedicineOrderDetailSerializer,
    EMedicineOrderCreateSerializer,
    MedicineItemSerializer,
)


class EMedicinePharmacyViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for e-medicine pharmacies - read only"""
    
    queryset = EMedicinePharmacy.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['pharmacy_type', 'district', 'is_available', 'is_verified']
    search_fields = ['name', 'license_number', 'phone_number', 'address', 'district__name']
    ordering_fields = ['rating', 'delivery_time_hours', 'min_order_amount']
    ordering = ['-is_verified', '-rating']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EMedicinePharmacyDetailSerializer
        return EMedicinePharmacyListSerializer
    
    @action(detail=False, methods=['get'])
    def by_district(self, request):
        """Filter pharmacies by district"""
        district_id = request.query_params.get('district_id')
        if not district_id:
            return Response(
                {'error': 'district_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pharmacies = self.queryset.filter(district_id=district_id)
        serializer = self.get_serializer(pharmacies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_pharmacy_type(self, request):
        """Filter pharmacies by type"""
        pharmacy_type = request.query_params.get('type')
        if not pharmacy_type:
            return Response(
                {'error': 'type parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pharmacies = self.queryset.filter(pharmacy_type=pharmacy_type)
        serializer = self.get_serializer(pharmacies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def verified_only(self, request):
        """Get only verified pharmacies"""
        pharmacies = self.queryset.filter(is_verified=True)
        serializer = self.get_serializer(pharmacies, many=True)
        return Response(serializer.data)


class MedicineItemViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for medicine items - read only"""
    
    queryset = MedicineItem.objects.all()
    serializer_class = MedicineItemSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['medicine_type', 'is_available']
    search_fields = ['name', 'generic_name', 'manufacturer']
    ordering_fields = ['price', 'created_at']
    ordering = ['-created_at']


class EMedicineOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for e-medicine orders - full CRUD"""
    
    queryset = EMedicineOrder.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'urgency', 'pharmacy']
    search_fields = ['patient_name', 'order_id', 'contact_phone']
    ordering_fields = ['created_at', 'total_amount', 'required_date']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EMedicineOrderCreateSerializer
        elif self.action == 'retrieve':
            return EMedicineOrderDetailSerializer
        return EMedicineOrderListSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new medicine order"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return detail serializer with created order
        order = serializer.instance
        detail_serializer = EMedicineOrderDetailSerializer(order)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm an order"""
        order = self.get_object()
        if order.status != 'pending':
            return Response(
                {'error': 'Only pending orders can be confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'confirmed'
        order.save()
        serializer = EMedicineOrderDetailSerializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an order"""
        order = self.get_object()
        if order.status in ['delivered', 'cancelled']:
            return Response(
                {'error': f'Cannot cancel order with status {order.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'cancelled'
        order.save()
        serializer = EMedicineOrderDetailSerializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update order status"""
        order = self.get_object()
        new_status = request.data.get('status')
        
        valid_statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = new_status
        order.save()
        serializer = EMedicineOrderDetailSerializer(order)
        return Response(serializer.data)
