from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Payment
from .serializers import PaymentSerializer, PaymentListSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gateway', 'payment_type', 'status']
    search_fields = ['transaction_id', 'user__email']
    ordering_fields = ['amount', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Payment.objects.all()
        return Payment.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PaymentListSerializer
        return PaymentSerializer
    
    @action(detail=False, methods=['post'])
    def initiate_payment(self, request):
        """Initiate a payment"""
        serializer = PaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save(user=request.user, status='pending')
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        """Confirm payment after gateway callback"""
        payment = self.get_object()
        payment.status = 'success'
        payment.gateway_response = request.data.get('gateway_response', {})
        payment.save()
        return Response({'detail': 'Payment confirmed successfully'})
    
    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """Refund a payment"""
        payment = self.get_object()
        if payment.status != 'success':
            return Response(
                {'detail': 'Only successful payments can be refunded'},
                status=status.HTTP_400_BAD_REQUEST
            )
        payment.status = 'refunded'
        payment.refund_amount = payment.amount
        payment.refund_reason = request.data.get('reason', '')
        payment.save()
        return Response({'detail': 'Payment refunded successfully'})
