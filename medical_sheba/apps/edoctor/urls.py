from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EDoctorProfileViewSet, ConsultationSlotViewSet, EDoctorConsultationViewSet

router = DefaultRouter()
router.register(r'doctors', EDoctorProfileViewSet, basename='edoctor-doctor')
router.register(r'slots', ConsultationSlotViewSet, basename='edoctor-slot')
router.register(r'consultations', EDoctorConsultationViewSet, basename='edoctor-consultation')

urlpatterns = [
    path('', include(router.urls)),
]
