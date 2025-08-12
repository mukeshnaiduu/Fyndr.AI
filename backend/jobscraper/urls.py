from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobPostingViewSet, RecruiterJobViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'jobs', JobPostingViewSet, basename='job')
router.register(r'recruiter/jobs', RecruiterJobViewSet, basename='recruiter-jobs')

urlpatterns = [
    path('api/', include(router.urls)),
]
