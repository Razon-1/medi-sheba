from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import User
from .serializers import UserSerializer, UserDetailSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'district', 'is_active', 'is_verified']
    search_fields = ['email', 'phone', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'first_name']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserDetailSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'register']:
            return [AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny()])
    def register(self, request):
        """Register a new user"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current logged-in user details"""
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        """Change user password"""
        user = self.get_object()
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not user.check_password(old_password):
            return Response(
                {'detail': 'Old password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password changed successfully'})
