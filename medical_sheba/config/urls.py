"""
URL Configuration for medical_sheba project.
"""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # API Routes
    path('api/users/', include('apps.users.urls')),
    path('api/hospitals/', include('apps.hospitals.urls')),
    path('api/doctors/', include('apps.doctors.urls')),
    path('api/appointments/', include('apps.appointments.urls')),
    path('api/blood/', include('apps.blood.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/location/', include('apps.location.urls')),
    path('api/search/', include('apps.search.urls')),
    path('api/ambulance/', include('apps.ambulance.urls')),
    path('api/emedicine/', include('apps.emedicine.urls')),
    path('api/edoctor/', include('apps.edoctor.urls')),
    path('api/contact/', include('apps.contact.urls')),
]

# Debug Toolbar URLs (development only)
if settings.DEBUG:
    urlpatterns += [path('__debug__/', include('debug_toolbar.urls'))]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

admin.site.site_header = 'Medi-Sheba Admin'
admin.site.site_title = 'Medi-Sheba'
