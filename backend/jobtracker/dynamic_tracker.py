"""
Dynamic Real-Time Job Application Tracking Service

This module provides comprehensive real-time tracking capabilities for job applications,
including status monitoring, ATS synchronization, email parsing, and analytics updates.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Set
from dataclasses import dataclass, asdict
from collections import defaultdict
import json

from django.core.cache import cache
from django.utils import timezone
from django.db.models import Q, Count, Avg
from asgiref.sync import sync_to_async

from jobapplier.models import Application, ApplicationStatusHistory
from fyndr_auth.models import JobSeekerProfile
from .analytics import ApplicationAnalytics
from .ats_sync import GreenhouseClient, LeverClient, WorkdayClient
from .email_parser import EmailStatusParser

logger = logging.getLogger(__name__)


@dataclass
class ApplicationUpdate:
    """Data class for application status updates"""
    application_id: int
    old_status: str
    new_status: str
    source: str
    timestamp: datetime
    notes: str = ""
    confidence: float = 1.0


@dataclass
class TrackingEvent:
    """Data class for tracking events"""
    event_type: str  # 'status_change', 'interview_scheduled', 'rejection', 'offer'
    application_id: int
    user_id: int
    data: Dict[str, Any]
    timestamp: datetime


class DynamicApplicationTracker:
    """
    Dynamic real-time application tracking service that monitors application statuses
    across multiple sources (ATS, email, manual updates) and provides live analytics.
    """
    
    def __init__(self):
        """Initialize the dynamic tracker"""
        self.analytics = ApplicationAnalytics()
        self.email_parser = EmailStatusParser()
        
        # ATS clients
        self.ats_clients = {
            'greenhouse': GreenhouseClient(),
            'lever': LeverClient(), 
            'workday': WorkdayClient()
        }
        
        # Tracking state
        self._tracking_tasks: Dict[int, asyncio.Task] = {}
        self._active_users: Set[int] = set()
        self._is_running = False
        
        # Configuration
        self._check_interval = 300  # 5 minutes
        self._email_check_interval = 180  # 3 minutes
        self._ats_sync_interval = 600  # 10 minutes
        self._analytics_update_interval = 900  # 15 minutes
        
        # Event handlers
        self._event_handlers: Dict[str, List[callable]] = defaultdict(list)
        
        logger.info("DynamicApplicationTracker initialized")
    
    async def start_tracking(self, user_ids: List[int] = None) -> bool:
        """
        Start real-time tracking for specified users or all active users
        """
        try:
            if user_ids:
                self._active_users.update(user_ids)
            else:
                # Get all users with active applications
                active_user_ids = await sync_to_async(list)(
                    Application.objects.filter(
                        status__in=['pending', 'applied', 'interviewing', 'reviewing']
                    ).values_list('user_profile__user__id', flat=True).distinct()
                )
                self._active_users.update(active_user_ids)
            
            if not self._is_running:
                self._is_running = True
                
                # Start monitoring tasks
                await self._start_monitoring_loops()
                
                logger.info(f"Started dynamic tracking for {len(self._active_users)} users")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to start tracking: {e}")
            return False
    
    async def stop_tracking(self, user_id: int = None) -> bool:
        """
        Stop tracking for specific user or all users
        """
        try:
            if user_id:
                self._active_users.discard(user_id)
                if user_id in self._tracking_tasks:
                    self._tracking_tasks[user_id].cancel()
                    del self._tracking_tasks[user_id]
            else:
                # Stop all tracking
                self._is_running = False
                self._active_users.clear()
                
                for task in self._tracking_tasks.values():
                    task.cancel()
                self._tracking_tasks.clear()
            
            logger.info(f"Stopped tracking for user {user_id if user_id else 'all users'}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to stop tracking: {e}")
            return False
    
    async def _start_monitoring_loops(self):
        """Start all monitoring background tasks"""
        # Main status monitoring loop
        asyncio.create_task(self._monitor_application_statuses())
        
        # Email monitoring loop  
        asyncio.create_task(self._monitor_email_updates())
        
        # ATS synchronization loop
        asyncio.create_task(self._sync_ats_statuses())
        
        # Analytics update loop
        asyncio.create_task(self._update_analytics_cache())
        
        logger.info("Started all monitoring loops")
    
    async def _monitor_application_statuses(self):
        """Main loop for monitoring application status changes"""
        while self._is_running:
            try:
                for user_id in list(self._active_users):
                    await self._check_user_applications(user_id)
                
                await asyncio.sleep(self._check_interval)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in status monitoring: {e}")
                await asyncio.sleep(30)  # Wait before retrying
    
    async def _check_user_applications(self, user_id: int):
        """Check and update application statuses for a specific user"""
        try:
            # Get user's active applications
            applications = await sync_to_async(list)(
                Application.objects.filter(
                    user_profile__user__id=user_id,
                    status__in=['pending', 'applied', 'interviewing', 'reviewing']
                ).select_related('user_profile', 'job')
            )
            
            for application in applications:
                await self._check_single_application(application)
                
        except Exception as e:
            logger.error(f"Failed to check applications for user {user_id}: {e}")
    
    async def _check_single_application(self, application: Application):
        """Check status updates for a single application"""
        try:
            updates = []
            
            # Check ATS status if available
            if hasattr(application, 'ats_id') and application.ats_id:
                ats_update = await self._check_ats_status(application)
                if ats_update:
                    updates.append(ats_update)
            
            # Check for email updates
            email_updates = await self._check_email_status(application)
            updates.extend(email_updates)
            
            # Process any status updates found
            for update in updates:
                await self._process_status_update(update)
                
        except Exception as e:
            logger.error(f"Failed to check application {application.id}: {e}")
    
    async def _check_ats_status(self, application: Application) -> Optional[ApplicationUpdate]:
        """Check ATS for status updates"""
        try:
            # Determine ATS platform
            ats_platform = self._detect_ats_platform(application.job.url if application.job else "")
            
            if ats_platform and ats_platform in self.ats_clients:
                client = self.ats_clients[ats_platform]
                status_info = await sync_to_async(client.get_application_status)(
                    str(application.ats_id)
                )
                
                if status_info and status_info.status != application.status:
                    return ApplicationUpdate(
                        application_id=application.id,
                        old_status=application.status,
                        new_status=status_info.status,
                        source=f'ats_{ats_platform}',
                        timestamp=status_info.updated_at,
                        notes=status_info.notes,
                        confidence=0.9
                    )
            
            return None
            
        except Exception as e:
            logger.error(f"ATS status check failed for application {application.id}: {e}")
            return None
    
    async def _check_email_status(self, application: Application) -> List[ApplicationUpdate]:
        """Check email for status updates"""
        try:
            # Get recent emails for this user
            user_email = application.user_profile.user.email
            
            # Parse emails from last 24 hours for status updates
            email_updates = await sync_to_async(self.email_parser.parse_recent_emails)(
                user_email, 
                hours_back=24,
                application_id=application.id
            )
            
            updates = []
            for email_update in email_updates:
                if email_update['status'] != application.status:
                    updates.append(ApplicationUpdate(
                        application_id=application.id,
                        old_status=application.status,
                        new_status=email_update['status'],
                        source='email_parser',
                        timestamp=email_update['timestamp'],
                        notes=email_update.get('notes', ''),
                        confidence=email_update.get('confidence', 0.7)
                    ))
            
            return updates
            
        except Exception as e:
            logger.error(f"Email status check failed for application {application.id}: {e}")
            return []
    
    async def _process_status_update(self, update: ApplicationUpdate):
        """Process and apply a status update"""
        try:
            # Get the application
            application = await sync_to_async(Application.objects.get)(
                id=update.application_id
            )
            
            # Update application status
            old_status = application.status
            application.status = update.new_status
            application.updated_at = timezone.now()
            await sync_to_async(application.save)()
            
            # Create status history record
            await sync_to_async(ApplicationStatusHistory.objects.create)(
                application=application,
                status=update.new_status,
                source=update.source,
                notes=update.notes,
                updated_at=update.timestamp,
                confidence_score=update.confidence
            )
            
            # Fire tracking event
            event = TrackingEvent(
                event_type='status_change',
                application_id=update.application_id,
                user_id=application.user_profile.user.id,
                data={
                    'old_status': old_status,
                    'new_status': update.new_status,
                    'source': update.source,
                    'confidence': update.confidence
                },
                timestamp=update.timestamp
            )
            
            await self._fire_event(event)
            
            # Update cache
            cache_key = f"application_status_{update.application_id}"
            cache.set(cache_key, {
                'status': update.new_status,
                'updated_at': update.timestamp.isoformat(),
                'source': update.source
            }, 3600)
            
            logger.info(f"Updated application {update.application_id}: {old_status} -> {update.new_status}")
            
        except Exception as e:
            logger.error(f"Failed to process status update: {e}")
    
    async def _monitor_email_updates(self):
        """Background loop for monitoring email updates"""
        while self._is_running:
            try:
                # Process email updates for all active users
                for user_id in list(self._active_users):
                    await self._process_user_emails(user_id)
                
                await asyncio.sleep(self._email_check_interval)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in email monitoring: {e}")
                await asyncio.sleep(60)
    
    async def _process_user_emails(self, user_id: int):
        """Process emails for a specific user"""
        try:
            user = await sync_to_async(JobSeekerProfile.objects.get)(user__id=user_id)
            
            # Parse recent emails
            email_updates = await sync_to_async(self.email_parser.parse_recent_emails)(
                user.user.email,
                hours_back=3  # Check last 3 hours
            )
            
            # Process any updates found
            for email_update in email_updates:
                if email_update.get('application_id'):
                    update = ApplicationUpdate(
                        application_id=email_update['application_id'],
                        old_status='unknown',  # Will be set when processing
                        new_status=email_update['status'],
                        source='email_monitor',
                        timestamp=email_update['timestamp'],
                        notes=email_update.get('notes', ''),
                        confidence=email_update.get('confidence', 0.7)
                    )
                    
                    await self._process_status_update(update)
                    
        except Exception as e:
            logger.error(f"Failed to process emails for user {user_id}: {e}")
    
    async def _sync_ats_statuses(self):
        """Background loop for ATS synchronization"""
        while self._is_running:
            try:
                # Sync ATS statuses for all active applications
                await self._bulk_ats_sync()
                
                await asyncio.sleep(self._ats_sync_interval)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in ATS sync: {e}")
                await asyncio.sleep(120)
    
    async def _bulk_ats_sync(self):
        """Perform bulk ATS synchronization"""
        try:
            # Get all applications with ATS IDs
            applications = await sync_to_async(list)(
                Application.objects.filter(
                    user_profile__user__id__in=self._active_users,
                    ats_id__isnull=False
                ).select_related('user_profile', 'job')
            )
            
            for application in applications:
                await self._check_single_application(application)
                
            logger.info(f"Completed ATS sync for {len(applications)} applications")
            
        except Exception as e:
            logger.error(f"Bulk ATS sync failed: {e}")
    
    async def _update_analytics_cache(self):
        """Background loop for updating analytics cache"""
        while self._is_running:
            try:
                # Update analytics for all active users
                for user_id in list(self._active_users):
                    await self._update_user_analytics_cache(user_id)
                
                await asyncio.sleep(self._analytics_update_interval)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in analytics update: {e}")
                await asyncio.sleep(180)
    
    async def _update_user_analytics_cache(self, user_id: int):
        """Update analytics cache for a specific user"""
        try:
            user_profile = await sync_to_async(JobSeekerProfile.objects.get)(user__id=user_id)
            
            # Calculate analytics
            analytics_data = await sync_to_async(self.analytics.get_application_counts)(
                user_profile=user_profile,
                time_range="30d"
            )
            
            # Cache analytics
            cache_key = f"user_analytics_{user_id}"
            cache.set(cache_key, analytics_data, 1800)  # 30 minutes
            
        except Exception as e:
            logger.error(f"Failed to update analytics for user {user_id}: {e}")
    
    def _detect_ats_platform(self, url: str) -> Optional[str]:
        """Detect ATS platform from job URL"""
        if not url:
            return None
            
        url_lower = url.lower()
        
        if 'greenhouse' in url_lower or 'boards.greenhouse.io' in url_lower:
            return 'greenhouse'
        elif 'lever' in url_lower or 'jobs.lever.co' in url_lower:
            return 'lever' 
        elif 'workday' in url_lower or 'myworkdayjobs.com' in url_lower:
            return 'workday'
        
        return None
    
    async def _fire_event(self, event: TrackingEvent):
        """Fire tracking event to registered handlers"""
        try:
            event_data = asdict(event)
            
            # Call registered handlers
            for handler in self._event_handlers.get(event.event_type, []):
                try:
                    if asyncio.iscoroutinefunction(handler):
                        await handler(event_data)
                    else:
                        handler(event_data)
                except Exception as e:
                    logger.error(f"Event handler failed: {e}")
            
            # Cache recent events
            cache_key = f"recent_events_{event.user_id}"
            recent_events = cache.get(cache_key, [])
            recent_events.append(event_data)
            
            # Keep only last 50 events
            if len(recent_events) > 50:
                recent_events = recent_events[-50:]
            
            cache.set(cache_key, recent_events, 7200)  # 2 hours
            
        except Exception as e:
            logger.error(f"Failed to fire event: {e}")
    
    def register_event_handler(self, event_type: str, handler: callable):
        """Register an event handler for specific event types"""
        self._event_handlers[event_type].append(handler)
        logger.info(f"Registered handler for event type: {event_type}")
    
    async def get_real_time_status(self, application_id: int) -> Dict[str, Any]:
        """Get real-time status for a specific application"""
        try:
            cache_key = f"application_status_{application_id}"
            cached_status = cache.get(cache_key)
            
            if cached_status:
                return cached_status
            
            # Get from database
            application = await sync_to_async(Application.objects.get)(id=application_id)
            
            status_data = {
                'status': application.status,
                'updated_at': application.updated_at.isoformat(),
                'source': 'database'
            }
            
            cache.set(cache_key, status_data, 3600)
            return status_data
            
        except Exception as e:
            logger.error(f"Failed to get real-time status for application {application_id}: {e}")
            return {}
    
    async def get_user_tracking_summary(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive tracking summary for a user"""
        try:
            # Get analytics from cache
            analytics_key = f"user_analytics_{user_id}"
            analytics = cache.get(analytics_key, {})
            
            # Get recent events
            events_key = f"recent_events_{user_id}"
            recent_events = cache.get(events_key, [])
            
            # Get active applications
            active_apps = await sync_to_async(
                Application.objects.filter(
                    user_profile__user__id=user_id,
                    status__in=['pending', 'applied', 'interviewing', 'reviewing']
                ).count
            )()
            
            return {
                'user_id': user_id,
                'analytics': analytics,
                'recent_events': recent_events[-10:],  # Last 10 events
                'active_applications': active_apps,
                'tracking_active': user_id in self._active_users,
                'last_updated': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get tracking summary for user {user_id}: {e}")
            return {}


# Global instance
dynamic_tracker = DynamicApplicationTracker()
