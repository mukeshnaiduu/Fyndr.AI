"""
URL configuration for jobtracker app.

This module defines API endpoints for job application tracking and analytics.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

# Create router for ViewSets
router = DefaultRouter()

urlpatterns = [
    # Analytics endpoints
    path('analytics/', views.ApplicationAnalyticsAPIView.as_view(), name='application-analytics'),
    path('stats/summary/', views.stats_summary, name='stats-summary'),
    
    # Application endpoints
    path('applications/', views.user_applications, name='user-applications'),
    path('applications/<int:user_id>/', views.user_applications, name='user-applications-by-id'),
    
    # Status history endpoints
    path('application/<uuid:application_id>/status-history/', views.application_status_history, name='application-status-history'),
    
    # Dynamic tracking endpoints
    path('tracking/', views.DynamicTrackingAPIView.as_view(), name='dynamic-tracking'),
    path('application/<int:application_id>/status/', views.get_real_time_application_status, name='real-time-status'),
    path('tracking/start-global/', views.start_global_tracking, name='start-global-tracking'),
    path('tracking/stats/', views.tracking_stats, name='tracking-stats'),
    
    # Include router URLs
    path('', include(router.urls)),
]

app_name = 'jobtracker'
