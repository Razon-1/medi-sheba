from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Doctor
from .serializers import DoctorSerializer, DoctorListSerializer


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
