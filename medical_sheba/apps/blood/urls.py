from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import BloodDonorViewSet, BloodRequestViewSet

router = DefaultRouter()
router.register(r'donors', BloodDonorViewSet, basename='blood-donor')
router.register(r'requests', BloodRequestViewSet, basename='blood-request')

urlpatterns = router.urls
