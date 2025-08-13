"""
URL patterns for JobApplier app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import bulk_apply

app_name = 'jobapplier'

# Create router for ViewSets
router = DefaultRouter()
router.register(r'applications', views.JobApplicationViewSet, basename='applications')
router.register(r'events', views.ApplicationEventViewSet, basename='events')
router.register(r'tracking', views.ApplicationTrackingViewSet, basename='tracking')

urlpatterns = [
    # ViewSet routes
    path('', include(router.urls)),
    
    # Individual job application
    path('apply/<int:job_id>/', views.apply_to_job, name='apply_to_job'),
    path('quick-apply/', views.quick_apply, name='quick_apply'),

    # Dynamic application endpoints (for real-time/automated flows)
    path('apply-dynamically/', views.apply_dynamically, name='apply_dynamically'),
    path('monitor-status/<uuid:application_id>/', views.monitor_status, name='monitor_status'),
    path('start-monitoring/', views.start_monitoring, name='start_monitoring'),
    path('stop-monitoring/', views.stop_monitoring, name='stop_monitoring'),
    path('verify/<uuid:application_id>/', views.verify_application, name='verify_application'),
    path('confirm-applied/<uuid:application_id>/', views.confirm_applied, name='confirm_applied'),
    path('sync-gmail-confirmations/', views.sync_gmail_confirmations, name='sync_gmail_confirmations'),
    # Health check
    path('health/', views.health, name='health'),
    
    # Bulk and smart application endpoints
    path('bulk-apply/', bulk_apply.bulk_apply_to_jobs, name='bulk_apply_to_jobs'),
    path('quick-apply-matching/', bulk_apply.quick_apply_with_matching, name='quick_apply_with_matching'),
    path('suggestions/', bulk_apply.get_application_suggestions, name='get_application_suggestions'),
    
    # Dashboard and analytics
    path('dashboard/', views.dashboard_data, name='dashboard_data'),
    # Recruiter endpoints
    path('recruiter/applicants/', views.recruiter_applicants, name='recruiter_applicants'),
    path('recruiter/applications/<uuid:application_id>/events/', views.recruiter_application_events, name='recruiter_application_events'),
    path('recruiter/applications/<uuid:application_id>/update-status/', views.recruiter_update_application_status, name='recruiter_update_application_status'),
    # Secure file download
    path('recruiter/download/<uuid:application_id>/<str:file_key>/', views.download_application_file, name='download_application_file'),
    
    # Legacy support
    path('applications/list/', views.get_user_applications, name='get_user_applications'),
]
