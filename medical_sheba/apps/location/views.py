from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import District, Upazila
from .serializers import (
    DistrictSerializer, DistrictListSerializer,
    UpazilaSerializer, UpazilaListSerializer
)


class DistrictViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'region']
    ordering_fields = ['name']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DistrictListSerializer
        return DistrictSerializer
    
    @action(detail=False, methods=['get'])
    def by_region(self, request):
        """Get districts by region"""
        region = request.query_params.get('region')
        if not region:
            return Response(
                {'detail': 'region parameter required'},
                status=400
            )
        districts = self.queryset.filter(region=region)
        serializer = DistrictListSerializer(districts, many=True)
        return Response(serializer.data)


class UpazilaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Upazila.objects.all()
    serializer_class = UpazilaSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['district']
    search_fields = ['name', 'code']
    ordering_fields = ['name']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UpazilaListSerializer
        return UpazilaSerializer
    
    @action(detail=False, methods=['get'])
    def by_district(self, request):
        """Get upazilas by district"""
        district_id = request.query_params.get('district_id')
        if not district_id:
            return Response(
                {'detail': 'district_id parameter required'},
                status=400
            )
        upazilas = self.queryset.filter(district_id=district_id)
        serializer = UpazilaListSerializer(upazilas, many=True)
        return Response(serializer.data)
