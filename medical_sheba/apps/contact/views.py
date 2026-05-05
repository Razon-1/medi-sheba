from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Q
from .models import ContactMessage
from .serializers import ContactMessageSerializer


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        if self.action == 'create':
            # Allow anyone to create contact messages
            return []
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            # Only admins can view, update, or delete messages
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                'message': 'Thank you for your message! We will get back to you soon.',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def new_messages(self, request):
        """Get all new (unread) messages"""
        messages = self.queryset.filter(status='new')
        serializer = self.get_serializer(messages, many=True)
        return Response({
            'count': messages.count(),
            'messages': serializer.data
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def mark_as_read(self, request, pk=None):
        """Mark a message as read"""
        message = self.get_object()
        message.status = 'read'
        message.save()
        serializer = self.get_serializer(message)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def mark_as_responded(self, request, pk=None):
        """Mark a message as responded"""
        message = self.get_object()
        message.status = 'responded'
        if 'admin_notes' in request.data:
            message.admin_notes = request.data['admin_notes']
        if request.user.is_staff:
            message.assigned_to = request.user
        message.save()
        serializer = self.get_serializer(message)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def search(self, request):
        """Search contact messages"""
        query = request.query_params.get('q', '')
        messages = self.queryset.filter(
            Q(name__icontains=query) |
            Q(email__icontains=query) |
            Q(subject__icontains=query) |
            Q(message__icontains=query)
        )
        serializer = self.get_serializer(messages, many=True)
        return Response({
            'count': messages.count(),
            'messages': serializer.data
        })
