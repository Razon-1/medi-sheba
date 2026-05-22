from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail, EmailMessage
from django.utils import timezone
from datetime import timedelta
import secrets
from django.conf import settings
import logging
from .models import User, PasswordResetToken
from .serializers import UserSerializer, UserDetailSerializer

logger = logging.getLogger(__name__)


SUPERUSER_FRONTEND_ROLES = [
    'admin',
    'hospital_admin',
    'pharmacy_admin',
    'ambulance_driver_admin',
]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['district', 'is_active', 'is_verified']
    search_fields = ['email', 'phone', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'first_name']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_superuser:
            return User.objects.all()
        if user.is_authenticated:
            return User.objects.filter(pk=user.pk)
        return User.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserDetailSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action in [
            'create',
            'register',
            'login',
            'recover_password',
            'request_password_reset',
            'confirm_password_reset',
            'email_debug',
            'home_stats',
        ]:
            return [AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny()])
    def login(self, request):
        """Authenticate user and return JWT tokens"""
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role')
        
        if not email or not password:
            return Response(
                {'detail': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not role:
            return Response(
                {'detail': 'Login role is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(request, username=email, password=password)
        
        if not user:
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if role not in user.roles and not user.is_superuser:
            return Response(
                {'detail': 'This account is not registered for the selected role.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        if user.is_superuser:
            user_data['roles'] = list(dict.fromkeys([*SUPERUSER_FRONTEND_ROLES, *user_data.get('roles', [])]))
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_data
        })
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny()])
    def register(self, request):
        """Register a new user"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Return JWT tokens after registration
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny()])
    def recover_password(self, request):
        """Legacy direct reset endpoint. Prefer request_password_reset + confirm_password_reset."""
        email = request.data.get('email')
        phone = request.data.get('phone')
        new_password = request.data.get('new_password')

        if not email or not phone or not new_password:
            return Response(
                {'detail': 'Email, phone, and new password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 6:
            return Response(
                {'detail': 'New password must be at least 6 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email__iexact=email.strip(), phone=phone.strip())
        except User.DoesNotExist:
            return Response(
                {'detail': 'No account found with that email and phone number'},
                status=status.HTTP_404_NOT_FOUND
            )

        user.set_password(new_password)
        user.save(update_fields=['password', 'updated_at'])
        return Response({'detail': 'Password updated successfully. You can now log in.'})

    @action(detail=False, methods=['post'], permission_classes=[AllowAny()])
    def request_password_reset(self, request):
        """Request password reset - generates token and sends email"""
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'detail': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email__iexact=email.strip())
        except User.DoesNotExist:
            # Don't reveal if email exists for security
            return Response(
                {'detail': 'If an account with this email exists, a password reset link has been sent.'},
                status=status.HTTP_200_OK
            )
        
        # Invalidate old tokens
        PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Generate new token
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=24)
        
        reset_token = PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        
        # Send email
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        email_subject = "Password Reset Request - Medi Sheba"
        email_message = f"""
Dear {user.get_full_name() or user.email},

We received a request to reset your password. Click the link below to reset your password:

{reset_link}

This link will expire in 24 hours.

If you did not request a password reset, please ignore this email.

Best regards,
Medi Sheba Team
"""
        
        try:
            logger.info(f"Attempting to send password reset email to {user.email}")
            logger.info(f"Email backend: {settings.EMAIL_BACKEND}")
            logger.info(f"Reset link: {reset_link}")
            
            send_mail(
                email_subject,
                email_message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            logger.info(f"Password reset email sent successfully to {user.email}")
        except Exception as e:
            logger.error(f"Error sending email to {user.email}: {str(e)}", exc_info=True)
            
            # Check if it's a configuration issue
            if not settings.DEFAULT_FROM_EMAIL:
                error_msg = 'Email not configured: DEFAULT_FROM_EMAIL is missing'
            elif 'filebased' in settings.EMAIL_BACKEND:
                error_msg = f'Email saved to sent_emails folder (check: {getattr(settings, "EMAIL_FILE_PATH", "not configured")})'
            elif 'console' in settings.EMAIL_BACKEND:
                error_msg = 'Email printed to console (not configured for production)'
            else:
                error_msg = f'Email service error: {str(e)}'
            
            return Response(
                {'detail': error_msg},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(
            {'detail': 'Password reset link has been sent to your email.'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny()])
    def confirm_password_reset(self, request):
        """Confirm password reset - validates token and updates password"""
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        if not token or not new_password or not confirm_password:
            return Response(
                {'detail': 'Token, new password, and confirm password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_password != confirm_password:
            return Response(
                {'detail': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 6:
            return Response(
                {'detail': 'Password must be at least 6 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
        except PasswordResetToken.DoesNotExist:
            return Response(
                {'detail': 'Invalid or expired reset token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not reset_token.is_valid():
            return Response(
                {'detail': 'Reset token has expired or has already been used'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update password
        user = reset_token.user
        user.set_password(new_password)
        user.save(update_fields=['password', 'updated_at'])
        
        # Mark token as used
        reset_token.mark_as_used()
        
        return Response(
            {'detail': 'Password has been reset successfully. You can now log in.'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], permission_classes=[AllowAny()])
    def email_debug(self, request):
        """Debug endpoint to check email configuration (development only)"""
        if not settings.DEBUG:
            return Response(
                {'detail': 'Email debug only available in development'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        debug_info = {
            'email_backend': settings.EMAIL_BACKEND,
            'default_from_email': settings.DEFAULT_FROM_EMAIL,
            'frontend_url': settings.FRONTEND_URL,
            'sent_emails_folder': str(getattr(settings, 'EMAIL_FILE_PATH', 'Not configured')),
            'django_environment': 'DEVELOPMENT' if settings.DEBUG else 'PRODUCTION',
        }
        
        # Check if sent_emails folder exists
        if hasattr(settings, 'EMAIL_FILE_PATH'):
            import os
            email_path = settings.EMAIL_FILE_PATH
            if os.path.exists(email_path):
                email_files = os.listdir(email_path)
                debug_info['sent_emails_count'] = len(email_files)
                debug_info['recent_emails'] = sorted(email_files)[-5:] if email_files else []
            else:
                debug_info['sent_emails_folder_exists'] = False
        
        return Response(debug_info)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def home_stats(self, request):
        """Public homepage counters."""
        from apps.appointments.models import Appointment
        from apps.doctors.models import Doctor
        from apps.edoctor.models import EDoctorProfile
        from apps.hospitals.models import Hospital

        return Response({
            'active_users': User.objects.filter(is_active=True).count(),
            'hospitals': Hospital.objects.filter(is_active=True).count(),
            'doctors': Doctor.objects.count() + EDoctorProfile.objects.count(),
            'appointments': Appointment.objects.count(),
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current logged-in user details"""
        data = UserDetailSerializer(request.user).data
        if request.user.is_superuser:
            data['roles'] = list(dict.fromkeys([*SUPERUSER_FRONTEND_ROLES, *data.get('roles', [])]))
        return Response(data)
    
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
