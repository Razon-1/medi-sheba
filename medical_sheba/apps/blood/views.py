from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from django_filters.rest_framework import DjangoFilterBackend
from .models import BloodDonor, BloodRequest
from .serializers import (
    BloodDonorSerializer, BloodDonorListSerializer,
    BloodRequestSerializer, BloodRequestListSerializer
)


class IsDonorOwnerOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if view.action in ['list', 'retrieve', 'by_blood_group', 'by_district']:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return obj.user == request.user


class BloodDonorViewSet(viewsets.ModelViewSet):
    queryset = BloodDonor.objects.all()
    serializer_class = BloodDonorSerializer
    permission_classes = [IsDonorOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['blood_group', 'district', 'is_available']
    search_fields = ['user__first_name', 'user__last_name', 'user__phone', 'contact_phone']
    ordering_fields = ['total_donations', 'last_donation_date']
    ordering = ['-total_donations']

    def get_queryset(self):
        queryset = BloodDonor.objects.all()
        if self.action in ['list', 'by_blood_group', 'by_district']:
            return queryset.filter(is_available=True)
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BloodDonorListSerializer
        return BloodDonorSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_blood_group(self, request):
        """Get donors by blood group"""
        blood_group = request.query_params.get('blood_group')
        if not blood_group:
            return Response(
                {'detail': 'blood_group parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        donors = self.get_queryset().filter(blood_group=blood_group)
        serializer = BloodDonorListSerializer(donors, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_district(self, request):
        """Get donors by district"""
        district = request.query_params.get('district')
        if not district:
            return Response(
                {'detail': 'district parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        donors = self.get_queryset().filter(district=district)
        serializer = BloodDonorListSerializer(donors, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        donor = BloodDonor.objects.filter(user=request.user).first()

        if request.method == 'GET':
            if not donor:
                return Response(
                    {'detail': 'No donor details found for this user.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = BloodDonorSerializer(donor)
            return Response(serializer.data)

        partial = request.method == 'PATCH'
        if donor:
            serializer = BloodDonorSerializer(donor, data=request.data, partial=partial)
        else:
            serializer = BloodDonorSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_200_OK if donor else status.HTTP_201_CREATED)


class BloodRequestViewSet(viewsets.ModelViewSet):
    queryset = BloodRequest.objects.filter(status__in=['open', 'fulfilled'])
    serializer_class = BloodRequestSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['blood_group', 'district', 'urgency', 'status']
    search_fields = ['patient_name', 'contact_phone']
    ordering_fields = ['urgency', 'required_date', 'created_at']
    ordering = ['-urgency', 'required_date']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BloodRequestListSerializer
        return BloodRequestSerializer
    
    @action(detail=False, methods=['get'])
    def urgent(self, request):
        """Get urgent blood requests"""
        requests = self.queryset.filter(urgency__in=['urgent', 'critical'])
        serializer = BloodRequestListSerializer(requests, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def fulfill(self, request, pk=None):
        """Mark blood request as fulfilled"""
        blood_request = self.get_object()
        blood_request.status = 'fulfilled'
        blood_request.save()
        return Response({'detail': 'Blood request marked as fulfilled'})
