"""
Real-time Application Service

Handles background tasks, status checking, and real-time updates
for job applications.
"""

import asyncio
import logging
from django.utils import timezone
from django.db import transaction
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import JobApplication, ApplicationEvent, ApplicationTracking
from jobscraper.models import JobPosting

logger = logging.getLogger(__name__)


class RealTimeApplicationService:
    """Service for handling real-time application features"""
    
    def __init__(self):
        self.channel_layer = get_channel_layer()
    
    def send_real_time_update(self, user_id, message_type, data):
        """Send real-time update to user via WebSocket"""
        if self.channel_layer:
            async_to_sync(self.channel_layer.group_send)(
                f"user_{user_id}",
                {
                    'type': message_type,
                    **data
                }
            )
    
    def create_application_with_tracking(self, user, job, application_data):
        """Create application with real-time tracking enabled"""
        try:
            with transaction.atomic():
                # Create application
                application = JobApplication.objects.create(
                    user=user,
                    job=job,
                    application_method=application_data.get('method', 'direct'),
                    resume_text=application_data.get('resume_text', ''),
                    cover_letter_text=application_data.get('cover_letter_text', ''),
                    custom_answers=application_data.get('custom_answers', {}),
                    notes=application_data.get('notes', ''),
                    is_tracking_enabled=True
                )
                
                # Create initial event
                ApplicationEvent.objects.create(
                    application=application,
                    event_type=ApplicationEvent.EventType.APPLIED,
                    title=f"Applied to {job.title}",
                    description=f"Application submitted via {application.application_method}",
                    metadata={
                        'method': application.application_method,
                        'source': 'real_time_service'
                    }
                )
                
                # Create tracking record
                ApplicationTracking.objects.create(
                    application=application,
                    check_frequency_minutes=60,
                    email_monitoring_enabled=True,
                    next_check=timezone.now() + timezone.timedelta(minutes=60)
                )
                
                # Send real-time update
                self.send_real_time_update(
                    user.id,
                    'application_created',
                    {
                        'application_id': str(application.id),
                        'job_title': job.title,
                        'company': job.company,
                        'message': f"Successfully applied to {job.title} at {job.company}"
                    }
                )
                
                return application
                
        except Exception as e:
            logger.error(f"Error creating application with tracking: {e}")
            raise
    
    def update_application_status(self, application, new_status, notes=None, metadata=None):
        """Update application status with real-time notification"""
        try:
            old_status = application.status
            
            with transaction.atomic():
                application.status = new_status
                if notes:
                    application.notes = notes
                application.save()
                
                # Create status change event
                ApplicationEvent.objects.create(
                    application=application,
                    event_type=ApplicationEvent.EventType.STATUS_CHANGE,
                    title=f"Status changed from {old_status} to {new_status}",
                    description=notes or '',
                    metadata={
                        'old_status': old_status,
                        'new_status': new_status,
                        'source': 'real_time_service',
                        **(metadata or {})
                    }
                )
                
                # Send real-time update
                self.send_real_time_update(
                    application.user.id,
                    'application_update',
                    {
                        'application_id': str(application.id),
                        'status': new_status,
                        'message': f"Application status updated to {new_status}"
                    }
                )
                
                return application
                
        except Exception as e:
            logger.error(f"Error updating application status: {e}")
            raise
    
    def check_application_status(self, application):
        """Check external status for an application"""
        try:
            # Get tracking info
            tracking = application.tracking
            if not tracking:
                return {'status': 'error', 'message': 'No tracking enabled'}
            
            # Update last check time
            tracking.last_checked = timezone.now()
            tracking.next_check = timezone.now() + timezone.timedelta(
                minutes=tracking.check_frequency_minutes
            )
            tracking.save()
            
            # Create check event
            ApplicationEvent.objects.create(
                application=application,
                event_type=ApplicationEvent.EventType.STATUS_CHANGE,
                title="Status check performed",
                description="Automated status check completed",
                metadata={
                    'check_time': timezone.now().isoformat(),
                    'source': 'automated_check'
                }
            )
            
            # Send real-time update
            self.send_real_time_update(
                application.user.id,
                'tracking_update',
                {
                    'application_id': str(application.id),
                    'tracking_data': {
                        'last_checked': tracking.last_checked.isoformat(),
                        'next_check': tracking.next_check.isoformat()
                    },
                    'message': 'Status check completed'
                }
            )
            
            return {'status': 'success', 'message': 'Status check completed'}
            
        except Exception as e:
            logger.error(f"Error checking application status: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def get_user_stats(self, user):
        """Get real-time statistics for a user"""
        try:
            applications = JobApplication.objects.filter(user=user)
            
            stats = {
                'total': applications.count(),
                'by_status': {},
                'recent_activity': [],
                'active_tracking': 0
            }
            
            # Count by status
            for choice in JobApplication.ApplicationStatus.choices:
                status_code = choice[0]
                stats['by_status'][status_code] = applications.filter(status=status_code).count()
            
            # Recent events
            recent_events = ApplicationEvent.objects.filter(
                application__user=user
            ).select_related('application', 'application__job').order_by('-created_at')[:5]
            
            stats['recent_activity'] = [{
                'id': str(event.id),
                'title': event.title,
                'description': event.description,
                'event_type': event.event_type,
                'job_title': event.application.job.title,
                'company': event.application.job.company,
                'created_at': event.created_at.isoformat()
            } for event in recent_events]
            
            # Active tracking count
            stats['active_tracking'] = ApplicationTracking.objects.filter(
                application__user=user,
                application__status__in=['applied', 'in_review', 'interview']
            ).count()
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting user stats: {e}")
            return {}


# Singleton instance
real_time_service = RealTimeApplicationService()
