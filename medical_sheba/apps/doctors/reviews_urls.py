from rest_framework.routers import DefaultRouter
from .views import DoctorReviewViewSet

router = DefaultRouter()
router.register(r'', DoctorReviewViewSet, basename='doctor-review')

urlpatterns = router.urls
