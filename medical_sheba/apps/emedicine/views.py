from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import EMedicinePharmacy, MedicineItem, EMedicineOrder
from .serializers import (
    EMedicinePharmacyListSerializer,
    EMedicinePharmacyDetailSerializer,
    EMedicinePharmacyCreateSerializer,
    EMedicineOrderListSerializer,
    EMedicineOrderDetailSerializer,
    EMedicineOrderCreateSerializer,
    MedicineItemSerializer,
)


class IsPharmacyAdmin(BasePermission):
    """Permission check for pharmacy admin"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_superuser or 'pharmacy_admin' in request.user.roles
        )


class IsPharmacyAdminOrReadOnly(BasePermission):
    """Allow pharmacy admins to manage their pharmacy, others can only read"""
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user and request.user.is_authenticated and (
            request.user.is_superuser or 'pharmacy_admin' in request.user.roles
        )
    
    def has_object_permission(self, request, view, obj):
        # Read permission for any request
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        if request.user.is_superuser:
            return True

        pharmacy = obj if isinstance(obj, EMedicinePharmacy) else getattr(obj, 'pharmacy', None)
        return pharmacy is not None and pharmacy.admin_user == request.user


def user_is_pharmacy_admin_for_order(user, order):
    if user.is_authenticated and user.is_superuser:
        return True
    return (
        user.is_authenticated
        and 'pharmacy_admin' in getattr(user, 'roles', [])
        and order.pharmacy.admin_user == user
    )


class EMedicinePharmacyViewSet(viewsets.ModelViewSet):
    """ViewSet for e-medicine pharmacies - with admin management"""
    
    queryset = EMedicinePharmacy.objects.all()
    permission_classes = [IsPharmacyAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['pharmacy_type', 'district', 'is_available', 'is_verified']
    search_fields = ['name', 'license_number', 'phone_number', 'address', 'district__name']
    ordering_fields = ['rating', 'delivery_time_hours', 'min_order_amount']
    ordering = ['-is_verified', '-rating']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EMedicinePharmacyCreateSerializer
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return EMedicinePharmacyDetailSerializer
        return EMedicinePharmacyListSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Pharmacy admins only see their own pharmacy
        if user.is_authenticated and user.is_superuser:
            return EMedicinePharmacy.objects.all()
        if user.is_authenticated and 'pharmacy_admin' in user.roles:
            return EMedicinePharmacy.objects.filter(admin_user=user)
        # Others see all available pharmacies
        return EMedicinePharmacy.objects.all()
    
    def perform_create(self, serializer):
        """Auto-assign current user as pharmacy admin"""
        user = self.request.user
        if not user.is_superuser and 'pharmacy_admin' not in user.roles:
            raise serializers.ValidationError("Only pharmacy admins can create pharmacies")
        # Require an active subscription or trial access window
        if not user.is_superuser and not user.has_active_subscription_access():
            raise serializers.ValidationError("Active subscription required. Please start a trial or purchase a plan before creating a pharmacy.")
        
        # Check if user already has a pharmacy
        if not user.is_superuser and EMedicinePharmacy.objects.filter(admin_user=user).exists():
            raise serializers.ValidationError("You already have a pharmacy. One pharmacy admin can manage only one pharmacy.")
        
        if user.is_superuser:
            serializer.save()
        else:
            serializer.save(admin_user=user)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_pharmacy(self, request):
        """Get the current user's pharmacy (for pharmacy admin)"""
        if not request.user.is_superuser and 'pharmacy_admin' not in request.user.roles:
            return Response(
                {'error': 'Only pharmacy admins can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            if request.user.is_superuser:
                pharmacy = EMedicinePharmacy.objects.order_by('-created_at').first()
                if not pharmacy:
                    raise EMedicinePharmacy.DoesNotExist
            else:
                pharmacy = EMedicinePharmacy.objects.get(admin_user=request.user)
            serializer = EMedicinePharmacyDetailSerializer(pharmacy)
            return Response(serializer.data)
        except EMedicinePharmacy.DoesNotExist:
            return Response(
                {'error': 'No pharmacy found for this admin'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def by_district(self, request):
        """Filter pharmacies by district"""
        district_id = request.query_params.get('district_id')
        if not district_id:
            return Response(
                {'error': 'district_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pharmacies = self.get_queryset().filter(district_id=district_id)
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
        
        pharmacies = self.get_queryset().filter(pharmacy_type=pharmacy_type)
        serializer = self.get_serializer(pharmacies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def verified_only(self, request):
        """Get only verified pharmacies"""
        pharmacies = self.get_queryset().filter(is_verified=True)
        serializer = self.get_serializer(pharmacies, many=True)
        return Response(serializer.data)


class MedicineItemViewSet(viewsets.ModelViewSet):
    """ViewSet for medicine items - admins can manage, others read"""
    
    queryset = MedicineItem.objects.all()
    serializer_class = MedicineItemSerializer
    permission_classes = [IsPharmacyAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['pharmacy', 'medicine_type', 'is_available']
    search_fields = ['name', 'generic_name', 'manufacturer']
    ordering_fields = ['price', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        # Pharmacy admins only see medicines from their pharmacy
        if user.is_authenticated and user.is_superuser:
            return MedicineItem.objects.all()
        if user.is_authenticated and 'pharmacy_admin' in user.roles:
            try:
                pharmacy = EMedicinePharmacy.objects.get(admin_user=user)
                return MedicineItem.objects.filter(pharmacy=pharmacy)
            except EMedicinePharmacy.DoesNotExist:
                return MedicineItem.objects.none()
        # Others see all medicines
        return MedicineItem.objects.all()
    
    def perform_create(self, serializer):
        """Auto-assign pharmacy to pharmacy admin's pharmacy"""
        user = self.request.user
        if user.is_superuser:
            if not serializer.validated_data.get('pharmacy'):
                raise serializers.ValidationError({'pharmacy': 'Pharmacy is required for super admin medicine creation.'})
            serializer.save()
        elif 'pharmacy_admin' in user.roles:
            try:
                pharmacy = EMedicinePharmacy.objects.get(admin_user=user)
                serializer.save(pharmacy=pharmacy)
            except EMedicinePharmacy.DoesNotExist:
                raise serializers.ValidationError("No pharmacy found for this admin")
        else:
            raise serializers.ValidationError("Only pharmacy admins can add medicines")
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_medicines(self, request):
        """Get all medicines for the current pharmacy admin"""
        if not request.user.is_superuser and 'pharmacy_admin' not in request.user.roles:
            return Response(
                {'error': 'Only pharmacy admins can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        medicines = self.get_queryset()
        serializer = self.get_serializer(medicines, many=True)
        return Response(serializer.data)


class EMedicineOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for e-medicine orders - full CRUD"""
    
    queryset = EMedicineOrder.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'urgency', 'pharmacy']
    search_fields = ['patient_name', 'order_id', 'contact_phone']
    ordering_fields = ['created_at', 'total_amount', 'required_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter orders by pharmacy admin's pharmacy"""
        user = self.request.user
        if user.is_authenticated and user.is_superuser:
            return EMedicineOrder.objects.all()
        if user.is_authenticated and 'pharmacy_admin' in user.roles:
            try:
                pharmacy = EMedicinePharmacy.objects.get(admin_user=user)
                return EMedicineOrder.objects.filter(pharmacy=pharmacy)
            except EMedicinePharmacy.DoesNotExist:
                # Pharmacy admin without assigned pharmacy sees no orders
                return EMedicineOrder.objects.none()
        if user.is_authenticated:
            return EMedicineOrder.objects.filter(contact_phone=user.phone)
        return EMedicineOrder.objects.none()
    
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

    def update(self, request, *args, **kwargs):
        order = self.get_object()
        if not user_is_pharmacy_admin_for_order(request.user, order):
            return Response(
                {'error': 'Only this pharmacy admin can update the order.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        if not user_is_pharmacy_admin_for_order(request.user, order):
            return Response(
                {'error': 'Only this pharmacy admin can update the order.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        order = self.get_object()
        if not user_is_pharmacy_admin_for_order(request.user, order):
            return Response(
                {'error': 'Only this pharmacy admin can delete the order.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm an order"""
        order = self.get_object()
        if not user_is_pharmacy_admin_for_order(request.user, order):
            return Response(
                {'error': 'Only this pharmacy admin can confirm the order.'},
                status=status.HTTP_403_FORBIDDEN
            )
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
        if order.status != 'pending':
            return Response(
                {'error': 'Medicine orders cannot be cancelled after pharmacy confirmation.'},
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
        if not user_is_pharmacy_admin_for_order(request.user, order):
            return Response(
                {'error': 'Only this pharmacy admin can update order status.'},
                status=status.HTTP_403_FORBIDDEN
            )
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
    
    @action(detail=True, methods=['post'])
    def mark_medicine_delivered(self, request, pk=None):
        """Mark a specific medicine as delivered in an order"""
        order = self.get_object()
        if not user_is_pharmacy_admin_for_order(request.user, order):
            return Response(
                {'error': 'Only this pharmacy admin can update delivered medicines.'},
                status=status.HTTP_403_FORBIDDEN
            )
        medicine_name = request.data.get('medicine_name')
        quantity = request.data.get('quantity', 1)
        
        if not medicine_name:
            return Response(
                {'error': 'medicine_name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Initialize delivered_medicines_list if empty
        if not order.delivered_medicines_list:
            order.delivered_medicines_list = {}
        
        # Add or update the delivered medicine quantity
        order.delivered_medicines_list[medicine_name] = quantity
        order.save()
        
        serializer = EMedicineOrderDetailSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def unmark_medicine_delivered(self, request, pk=None):
        """Remove a medicine from delivered list"""
        order = self.get_object()
        if not user_is_pharmacy_admin_for_order(request.user, order):
            return Response(
                {'error': 'Only this pharmacy admin can update delivered medicines.'},
                status=status.HTTP_403_FORBIDDEN
            )
        medicine_name = request.data.get('medicine_name')
        
        if not medicine_name:
            return Response(
                {'error': 'medicine_name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remove medicine from delivered list
        if order.delivered_medicines_list and medicine_name in order.delivered_medicines_list:
            del order.delivered_medicines_list[medicine_name]
            order.save()
        
        serializer = EMedicineOrderDetailSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
