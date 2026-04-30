from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime, timedelta
from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentListSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'type', 'payment_status']
    search_fields = ['appointment_no', 'patient__email']
    ordering_fields = ['appointment_date', 'created_at']
    ordering = ['-appointment_date']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return user.appointments.all()
        elif user.role == 'doctor':
            return Appointment.objects.filter(doctor__user=user)
        elif user.role == 'admin':
            return Appointment.objects.all()
        return Appointment.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AppointmentListSerializer
        return AppointmentSerializer
    
    @action(detail=False, methods=['get'])
    def my_appointments(self, request):
        """Get user's appointments"""
        appointments = self.get_queryset()
        serializer = AppointmentListSerializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming appointments"""
        today = datetime.now().date()
        appointments = self.get_queryset().filter(
            appointment_date__gte=today,
            status__in=['pending', 'confirmed']
        ).order_by('appointment_date')
        serializer = AppointmentListSerializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment"""
        appointment = self.get_object()
        if appointment.status == 'completed':
            return Response(
                {'detail': 'Cannot cancel completed appointment'},
                status=status.HTTP_400_BAD_REQUEST
            )
        appointment.status = 'cancelled'
        appointment.cancelled_by = request.user
        appointment.cancel_reason = request.data.get('reason', '')
        appointment.save()
        return Response({'detail': 'Appointment cancelled successfully'})
