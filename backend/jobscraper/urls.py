from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobPostingViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'jobs', JobPostingViewSet, basename='job')

urlpatterns = [
    path('api/', include(router.urls)),
]
