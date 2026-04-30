from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AmbulanceServiceViewSet, AmbulanceRequestViewSet

router = DefaultRouter()
router.register(r'services', AmbulanceServiceViewSet, basename='ambulance-service')
router.register(r'requests', AmbulanceRequestViewSet, basename='ambulance-request')

urlpatterns = [
    path('', include(router.urls)),
]
