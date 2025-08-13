"""
URL patterns for JobMatcher app
"""
from django.urls import path
from . import views

app_name = 'jobmatcher'

urlpatterns = [
    # Job scoring endpoints
    path('score-job/<int:job_id>/', views.score_single_job, name='score_single_job'),
    path('score-jobs/', views.score_multiple_jobs, name='score_multiple_jobs'),
    
    # User matches
    path('matches/', views.get_user_matches, name='get_user_matches'),
    
    # User preferences
    path('preferences/', views.user_preferences, name='user_preferences'),
    
    # Job packet builder endpoints
    path('build-packet/<int:job_id>/', views.build_single_packet, name='build_single_packet'),
    path('build-packets/', views.build_bulk_job_packets, name='build_bulk_packets'),
    path('packets/', views.get_job_packets, name='get_job_packets'),
    path('packets/summary/', views.get_packets_summary, name='get_packets_summary'),
    path('packets/<uuid:packet_id>/', views.get_packet_details, name='get_packet_details'),
    path('packets/<uuid:packet_id>/delete/', views.delete_job_packet, name='delete_job_packet'),
    
    # Dashboard analytics
    path('dashboard/', views.get_dashboard_analytics, name='get_dashboard_analytics'),
    
    # Utility endpoints
    path('clear-scores/', views.clear_job_scores, name='clear_job_scores'),
    
    # AI Enhancement Endpoints
    path('ai/enhance/score/<int:job_id>/', views.enhance_job_score_ai, name='enhance_job_score_ai'),
    path('ai/enhance/packet/<int:packet_id>/', views.enhance_prepared_job_ai, name='enhance_prepared_job_ai'),
    path('ai/status/', views.get_ai_service_status, name='get_ai_service_status'),
    path('ai/bulk-enhance/', views.bulk_enhance_with_ai, name='bulk_enhance_with_ai'),
    
    # Automation Endpoints
    path('automation/enable/', views.enable_automation, name='enable_automation'),
    path('automation/dashboard/', views.get_automation_dashboard, name='get_automation_dashboard'),
    path('automation/schedule/', views.schedule_applications, name='schedule_applications'),
    path('automation/pipeline/', views.get_application_pipeline_status, name='get_application_pipeline_status'),
]
