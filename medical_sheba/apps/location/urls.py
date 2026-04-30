from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import DistrictViewSet, UpazilaViewSet

router = DefaultRouter()
router.register(r'districts', DistrictViewSet, basename='district')
router.register(r'upazilas', UpazilaViewSet, basename='upazila')

urlpatterns = router.urls
