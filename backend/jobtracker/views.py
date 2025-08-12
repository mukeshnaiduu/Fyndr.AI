"""
Django REST Framework views for job tracking analytics and status management.

This module provides API endpoints for:
- Application analytics and metrics
- Status history tracking
- Dashboard data
- Real-time dynamic tracking
"""

import logging
from datetime import datetime
from typing import Dict, Any

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.contrib.auth.decorators import login_required

from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from jobapplier.models import JobApplication, ApplicationEvent, ApplicationTracking
from fyndr_auth.models import JobSeekerProfile
from jobtracker.analytics import ApplicationAnalytics, get_user_analytics_summary
from jobtracker.ats_sync import sync_application_status
from jobtracker.email_parser import EmailStatusParser
from jobtracker.dynamic_tracker import dynamic_tracker

logger = logging.getLogger(__name__)


class ApplicationAnalyticsAPIView(APIView):
    """
    API view for application analytics and metrics.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get comprehensive analytics for the authenticated user.
        
        Query parameters:
        - time_range: "7d", "30d", "90d", "6m", "1y" (default: "30d")
        - metric_type: "counts", "conversion", "sources", "timeline", "all" (default: "all")
        """
        try:
            # Get user profile
            user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
            
            # Get query parameters
            time_range = request.GET.get('time_range', '30d')
            metric_type = request.GET.get('metric_type', 'all')
            
            analytics = ApplicationAnalytics()
            
            if metric_type == 'counts':
                data = analytics.get_application_counts(user_profile, time_range)
            elif metric_type == 'conversion':
                data = analytics.get_conversion_rate(user_profile, time_range)
            elif metric_type == 'sources':
                data = analytics.get_top_sources_by_success(user_profile, time_range)
            elif metric_type == 'timeline':
                data = analytics.get_application_timeline(user_profile, time_range)
            else:  # metric_type == 'all'
                data = analytics.get_comprehensive_analytics(user_profile, time_range)
            
            return Response(data, status=status.HTTP_200_OK)
            
        except JobSeekerProfile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error in analytics API: {e}")
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@cache_page(60 * 5)  # Cache for 5 minutes
def stats_summary(request):
    """
    API endpoint: /api/stats/summary
    
    Get summary statistics for the authenticated user.
    Returns quick stats for dashboard widgets.
    """
    try:
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        
        analytics = ApplicationAnalytics()
        
        # Get data for multiple time ranges
        summary_data = {
            'current_month': analytics.get_application_counts(user_profile, '30d'),
            'current_week': analytics.get_application_counts(user_profile, '7d'),
            'conversion_rate': analytics.get_conversion_rate(user_profile, '90d'),
            'top_sources': analytics.get_top_sources_by_success(user_profile, '90d', limit=5)
        }
        
        # Add quick summary metrics
        summary_data['quick_stats'] = {
            'total_this_week': summary_data['current_week']['counts']['applied'],
            'total_this_month': summary_data['current_month']['counts']['applied'],
            'interviews_this_month': summary_data['current_month']['counts']['interview'],
            'offers_this_month': summary_data['current_month']['counts']['offer'],
            'success_rate': summary_data['conversion_rate']['conversion_rates']['offer_rate']
        }
        
        return Response(summary_data, status=status.HTTP_200_OK)
        
    except JobSeekerProfile.DoesNotExist:
        return Response(
            {'error': 'User profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error in stats summary: {e}")
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_applications(request, user_id=None):
    """
    API endpoint: /api/applications/<user_id>
    
    Get all applications for a specific user with status history.
    If user_id is not provided, use authenticated user.
    """
    try:
        # Only allow access to own data for now
        target_user = request.user

        # Ensure user profile exists (for future analytics joins)
        get_object_or_404(JobSeekerProfile, user=target_user)

        # Filters and pagination
        status_filter = request.GET.get('status')
        limit = int(request.GET.get('limit', 50))
        offset = int(request.GET.get('offset', 0))

        qs = JobApplication.objects.filter(user=target_user)
        if status_filter:
            qs = qs.filter(status=status_filter)

        total_count = qs.count()
        applications = qs.select_related('job').prefetch_related('events')[offset:offset+limit]

        applications_data = []
        for app in applications:
            applications_data.append({
                'id': str(app.id),
                'job': {
                    'title': app.job.title,
                    'company': app.job.company,
                    'location': app.job.location,
                    'source': getattr(app.job, 'source', 'Unknown'),
                    'url': getattr(app.job, 'url', '')
                },
                'status': app.status,
                'applied_at': app.applied_at.isoformat() if app.applied_at else None,
                'method': app.application_method,
                'confirmation_number': getattr(app, 'external_application_id', None),
                'application_url': getattr(app, 'application_url', None),
                'notes': app.notes,
                'latest_status': app.status,
                'status_history': [
                    {
                        'event_type': e.event_type,
                        'title': e.title,
                        'description': e.description,
                        'metadata': e.metadata,
                        'updated_at': e.created_at.isoformat()
                    }
                    for e in app.events.all()[:5]
                ]
            })

        return Response({
            'applications': applications_data,
            'pagination': {
                'total': total_count,
                'limit': limit,
                'offset': offset,
                'has_more': (offset + limit) < total_count
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error getting user applications: {e}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def application_status_history(request, application_id):
    """
    API endpoint: /api/application/<id>/status-history
    
    GET: Get status history for a specific application
    POST: Add new status update to application
    """
    try:
        # Get application and verify ownership
        application = get_object_or_404(JobApplication, id=application_id)
        
        if application.user != request.user:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.method == 'GET':
            # Return recent events for application
            history = ApplicationEvent.objects.filter(
                application=application
            ).order_by('-created_at')

            history_data = [
                {
                    'id': str(entry.id),
                    'event_type': entry.event_type,
                    'title': entry.title,
                    'description': entry.description,
                    'metadata': entry.metadata,
                    'updated_at': entry.created_at.isoformat()
                }
                for entry in history
            ]

            return Response({
                'application_id': str(application.id),
                'current_status': application.status,
                'history': history_data
            }, status=status.HTTP_200_OK)
            
        elif request.method == 'POST':
            # Add new status update
            new_status = request.data.get('status')
            source = request.data.get('source', 'user_manual')
            notes = request.data.get('notes', '')
            
            if not new_status:
                return Response(
                    {'error': 'Status is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate status using JobApplication choices
            valid_statuses = [choice[0] for choice in JobApplication.ApplicationStatus.choices]
            if new_status not in valid_statuses:
                return Response(
                    {'error': f'Invalid status. Valid options: {valid_statuses}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create status change event
            old_status = application.status
            history_entry = ApplicationEvent.objects.create(
                application=application,
                event_type=ApplicationEvent.EventType.STATUS_CHANGE,
                title=f'Status changed from {old_status} to {new_status}',
                description=notes or '',
                metadata={'source': source, 'old_status': old_status, 'new_status': new_status}
            )
            
            # Update application status
            application.status = new_status
            if notes:
                application.notes = notes
            application.save()
            
            return Response({
                'id': str(history_entry.id),
                'event_type': history_entry.event_type,
                'title': history_entry.title,
                'description': history_entry.description,
                'metadata': history_entry.metadata,
                'updated_at': history_entry.created_at.isoformat(),
                'message': 'Status updated successfully'
            }, status=status.HTTP_201_CREATED)
            
    except JobApplication.DoesNotExist:
        return Response(
            {'error': 'Application not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error in status history API: {e}")
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================================
# DYNAMIC REAL-TIME TRACKING ENDPOINTS
# ============================================================================

class DynamicTrackingAPIView(APIView):
    """
    API view for dynamic real-time application tracking.
    """
    permission_classes = [IsAuthenticated]
    
    async def get(self, request):
        """
        Get real-time tracking status and summary for authenticated user.
        """
        try:
            user_id = request.user.id
            
            # Get comprehensive tracking summary
            summary = await dynamic_tracker.get_user_tracking_summary(user_id)
            
            return Response(summary, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error getting tracking summary: {e}")
            return Response(
                {'error': 'Failed to get tracking summary'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    async def post(self, request):
        """
        Start dynamic tracking for authenticated user.
        """
        try:
            user_id = request.user.id
            
            # Start tracking
            started = await dynamic_tracker.start_tracking([user_id])
            
            if started:
                return Response({
                    'success': True,
                    'message': 'Dynamic tracking started successfully',
                    'user_id': user_id
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'message': 'Tracking already active or failed to start',
                    'user_id': user_id
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error starting tracking: {e}")
            return Response(
                {'error': 'Failed to start tracking'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    async def delete(self, request):
        """
        Stop dynamic tracking for authenticated user.
        """
        try:
            user_id = request.user.id
            
            # Stop tracking
            stopped = await dynamic_tracker.stop_tracking(user_id)
            
            return Response({
                'success': stopped,
                'message': 'Dynamic tracking stopped' if stopped else 'Tracking was not active',
                'user_id': user_id
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error stopping tracking: {e}")
            return Response(
                {'error': 'Failed to stop tracking'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
async def get_real_time_application_status(request, application_id):
    """
    Get real-time status for a specific application.
    
    URL: /api/tracker/application/<int:application_id>/status/
    """
    try:
        # Verify user owns the application
        user_profile = get_object_or_404(JobSeekerProfile, user=request.user)
        application = get_object_or_404(
            JobApplication, 
            id=application_id, 
            user=request.user
        )
        
        # Get real-time status
        status_data = await dynamic_tracker.get_real_time_status(application_id)
        
        return Response({
            'application_id': application_id,
            'real_time_status': status_data,
            'last_updated': status_data.get('updated_at'),
            'source': status_data.get('source', 'database')
        }, status=status.HTTP_200_OK)
        
    except JobApplication.DoesNotExist:
        return Response(
            {'error': 'Application not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error getting real-time status: {e}")
        return Response(
            {'error': 'Failed to get real-time status'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
async def start_global_tracking(request):
    """
    Start dynamic tracking for all users (admin only).
    
    URL: /api/tracker/start-global/
    """
    try:
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Start tracking for all users
        started = await dynamic_tracker.start_tracking()
        
        return Response({
            'success': started,
            'message': 'Global tracking started' if started else 'Tracking already active',
            'active_users': len(dynamic_tracker._active_users)
        }, status=status.HTTP_201_CREATED if started else status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error starting global tracking: {e}")
        return Response(
            {'error': 'Failed to start global tracking'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tracking_stats(request):
    """
    Get overall tracking statistics (admin only).
    
    URL: /api/tracker/stats/
    """
    try:
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return Response({
            'is_running': dynamic_tracker._is_running,
            'active_users': len(dynamic_tracker._active_users),
            'active_user_ids': list(dynamic_tracker._active_users),
            'tracking_tasks': len(dynamic_tracker._tracking_tasks),
            'check_interval': dynamic_tracker._check_interval,
            'email_check_interval': dynamic_tracker._email_check_interval,
            'ats_sync_interval': dynamic_tracker._ats_sync_interval
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting tracking stats: {e}")
        return Response(
            {'error': 'Failed to get tracking statistics'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
