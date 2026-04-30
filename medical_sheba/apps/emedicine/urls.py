from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EMedicinePharmacyViewSet, MedicineItemViewSet, EMedicineOrderViewSet

router = DefaultRouter()
router.register(r'pharmacies', EMedicinePharmacyViewSet, basename='pharmacy')
router.register(r'medicines', MedicineItemViewSet, basename='medicine')
router.register(r'orders', EMedicineOrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
