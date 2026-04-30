from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Hospital
from .serializers import HospitalSerializer, HospitalListSerializer


class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.filter(is_active=True)
    serializer_class = HospitalSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'district', 'emergency_available', 'is_verified']
    search_fields = ['name', 'address', 'phone_primary']
    ordering_fields = ['rating', 'created_at', 'name']
    ordering = ['-rating']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return HospitalListSerializer
        return HospitalSerializer
    
    @action(detail=False, methods=['get'])
    def by_district(self, request):
        """Get hospitals by district"""
        district = request.query_params.get('district')
        if not district:
            return Response(
                {'detail': 'district parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        hospitals = self.queryset.filter(district=district)
        serializer = HospitalListSerializer(hospitals, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def emergency(self, request):
        """Get hospitals with 24/7 emergency service"""
        hospitals = self.queryset.filter(emergency_available=True)
        serializer = HospitalListSerializer(hospitals, many=True)
        return Response(serializer.data)
