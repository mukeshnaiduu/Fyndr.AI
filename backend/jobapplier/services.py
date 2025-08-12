import logging
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from django.core.cache import cache
from django.db import transaction
from asgiref.sync import sync_to_async
from .models import Application, UserProfile, JobPosting, ApplicationStatusHistory
from .browser_automation import apply_with_browser
from .ats_clients.greenhouse_client import GreenhouseClient
from .ats_clients.lever_client import LeverClient
from .ats_clients.workday_client import WorkdayClient
# Note: RealTimeApplicationService is defined in this module below

logger = logging.getLogger(__name__)


class DynamicApplicationService:
    """
    Dynamic service orchestrator for real-time job applications.
    Handles routing, processing, and tracking applications with live updates.
    """
    
    def __init__(self):
        # Initialize ATS clients with API keys from settings
        self.greenhouse_client = GreenhouseClient(
            api_key=getattr(settings, 'GREENHOUSE_API_KEY', None)
        )
        self.lever_client = LeverClient(
            api_key=getattr(settings, 'LEVER_API_KEY', None)
        )
        self.workday_client = WorkdayClient(
            tenant_url=getattr(settings, 'WORKDAY_TENANT_URL', None),
            client_id=getattr(settings, 'WORKDAY_CLIENT_ID', None),
            client_secret=getattr(settings, 'WORKDAY_CLIENT_SECRET', None)
        )
        
        # ATS source mapping
        self.ats_mapping = {
            'greenhouse': {
                'client': self.greenhouse_client,
                'method': 'API'
            },
            'lever': {
                'client': self.lever_client,
                'method': 'API'
            },
            'workday': {
                'client': self.workday_client,
                'method': 'API'
            }
        }
        
        # Active application monitoring
        self.active_applications = {}
        self.status_listeners = {}
    
    async def apply_dynamically(self, job_id: int, user_profile: UserProfile, 
                               options: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Apply to job with full dynamic processing and real-time tracking
        """
        options = options or {}
        
        try:
            # Get job
            job = await sync_to_async(JobPosting.objects.get)(id=job_id, is_active=True)
            
            # Check if already applied
            existing_app = await sync_to_async(
                lambda: Application.objects.filter(
                    job=job, user_profile=user_profile
                ).first()
            )()
            
            if existing_app:
                return {
                    'success': False,
                    'error': 'Already applied to this job',
                    'application_id': existing_app.id
                }
            
            # Create application record
            application = await sync_to_async(Application.objects.create)(
                job=job,
                user_profile=user_profile,
                application_method=Application.ApplicationMethod.AUTOMATED,
                status=Application.ApplicationStatus.PENDING,
                applied_at=timezone.now(),
                notes='Dynamic real-time application'
            )
            
            # Determine application method
            if self._has_external_application_link(job):
                # Apply through external link using browser automation
                result = await self._apply_via_browser_automation(job, user_profile, application)
            else:
                # Apply through internal system
                result = await self._apply_via_internal_system(job, user_profile, application)
            
            # Update application status
            await self._update_application_status(
                application, 
                'applied' if result['success'] else 'failed',
                'automated_system',
                result.get('error', 'Application completed successfully')
            )
            
            # Start monitoring if successful
            if result['success']:
                await self._start_application_monitoring(application.id)
                
                # Cache application for quick access
                cache.set(f"application_{application.id}", result, 3600)
            
            result.update({
                'application_id': application.id,
                'timestamp': timezone.now().isoformat()
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Dynamic application failed for job {job_id}: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    def _has_external_application_link(self, job: JobPosting) -> bool:
        """Check if job has external application link"""
        return bool(job.url and job.url.strip() and not job.url.startswith('/'))
    
    async def _apply_via_browser_automation(self, job: JobPosting, user_profile: UserProfile,
                                          application: Application) -> Dict[str, Any]:
        """Apply to job using browser automation"""
        try:
            from .browser_automation import BrowserAutomation
            
            async with BrowserAutomation(headless=True) as browser:
                result = await browser.apply_to_job_url(job, user_profile)
                
                # Update application with results
                if result['success']:
                    await sync_to_async(lambda: setattr(
                        application, 'confirmation_number', result.get('confirmation_number')
                    ))()
                    await sync_to_async(lambda: setattr(
                        application, 'external_url', job.url
                    ))()
                    await sync_to_async(application.save)()
                
                return {
                    'success': result['success'],
                    'confirmation_number': result.get('confirmation_number'),
                    'error': result.get('error'),
                    'method': 'browser_automation',
                    'external_link_followed': True
                }
                
        except Exception as e:
            logger.error(f"Browser automation failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'method': 'browser_automation',
                'external_link_followed': False
            }
    
    async def _apply_via_internal_system(self, job: JobPosting, user_profile: UserProfile,
                                       application: Application) -> Dict[str, Any]:
        """Apply to job through internal system"""
        try:
            # Generate confirmation number for internal applications
            confirmation_number = f"INT-{job.id}-{user_profile.id}-{int(timezone.now().timestamp())}"
            
            # Update application
            await sync_to_async(lambda: setattr(
                application, 'confirmation_number', confirmation_number
            ))()
            await sync_to_async(application.save)()
            
            return {
                'success': True,
                'confirmation_number': confirmation_number,
                'method': 'internal_system',
                'external_link_followed': False
            }
            
        except Exception as e:
            logger.error(f"Internal application failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'method': 'internal_system',
                'external_link_followed': False
            }
    
    async def _update_application_status(self, application: Application, status: str,
                                       source: str, notes: str) -> None:
        """Update application status and create history record"""
        try:
            # Update application status
            await sync_to_async(lambda: setattr(application, 'status', status))()
            await sync_to_async(application.save)()
            
            # Create status history record
            await sync_to_async(ApplicationStatusHistory.objects.create)(
                application=application,
                status=status,
                source=source,
                notes=notes,
                updated_at=timezone.now()
            )
            
        except Exception as e:
            logger.error(f"Failed to update application status: {e}")
    
    async def batch_apply_dynamically(self, job_ids: List[int], user_profile: UserProfile,
                                    options: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Apply to multiple jobs with dynamic processing and live progress tracking
        """
        options = options or {}
        
        # Use the real-time batch service
        from .real_time_service import RealTimeApplicationBatch
        batch_service = RealTimeApplicationBatch()
        
        result = await batch_service.apply_to_multiple_jobs(
            job_ids=job_ids,
            user_profile=user_profile,
            max_concurrent=options.get('max_concurrent', 3),
            delay_between_applications=options.get('delay_between_applications', 30)
        )
        
        # Start monitoring for successful applications
        if result.get('applications'):
            for app in result['applications']:
                if app.get('success') and app.get('application_id'):
                    await self._start_application_monitoring(app['application_id'])
        
        return result
    
    async def _start_application_monitoring(self, application_id: int) -> None:
        """Start real-time monitoring for an application"""
        if application_id in self.active_applications:
            return
            
        self.active_applications[application_id] = {
            'started_at': timezone.now(),
            'last_check': timezone.now(),
            'status_updates': 0
        }
        
        # Start background monitoring task
        asyncio.create_task(self._monitor_application_loop(application_id))
    
    async def _monitor_application_loop(self, application_id: int) -> None:
        """Background loop for continuous application monitoring"""
        try:
            while application_id in self.active_applications:
                # Check for status updates from multiple sources
                await self._check_application_status(application_id)
                
                # Check for follow-up opportunities
                await self._check_follow_up_opportunities(application_id)
                
                # Wait before next check
                await asyncio.sleep(300)  # Check every 5 minutes
                
        except Exception as e:
            logger.error(f"Application monitoring failed for {application_id}: {e}")
        finally:
            self.active_applications.pop(application_id, None)
    
    async def _check_application_status(self, application_id: int) -> None:
        """Check application status from multiple sources"""
        try:
            application = await sync_to_async(Application.objects.get)(id=application_id)
            
            # Check email for updates
            email_status = await self._check_email_status(application)
            
            # Check ATS for updates
            ats_status = await self._check_ats_status(application)
            
            # Check company website for updates
            web_status = await self._check_web_status(application)
            
            # Process any status updates
            if email_status or ats_status or web_status:
                await self._process_status_update(application, {
                    'email': email_status,
                    'ats': ats_status,
                    'web': web_status
                })
                
        except Exception as e:
            logger.error(f"Status check failed for application {application_id}: {e}")
    
    async def _check_email_status(self, application: Application) -> Optional[Dict]:
        """Check email for application status updates"""
        try:
            # This would integrate with email parsing service
            from jobtracker.email_parser import EmailStatusParser
            
            parser = EmailStatusParser()
            # Check for emails related to this application
            # Implementation would search for emails containing:
            # - Company name
            # - Job title
            # - Application reference number
            
            return None  # Placeholder for now
            
        except Exception as e:
            logger.error(f"Email status check failed: {e}")
            return None
    
    async def _check_ats_status(self, application: Application) -> Optional[Dict]:
        """Check ATS for application status updates"""
        try:
            # This would integrate with ATS APIs
            if application.confirmation_number:
                # Use ATS-specific client to check status
                ats_info = self._detect_ats_system(application.job)
                
                if ats_info and ats_info['client']:
                    status = await sync_to_async(
                        ats_info['client'].get_application_status
                    )(application.confirmation_number)
                    
                    return status
            
            return None
            
        except Exception as e:
            logger.error(f"ATS status check failed: {e}")
            return None
    
    async def _check_web_status(self, application: Application) -> Optional[Dict]:
        """Check company website for application status updates"""
        try:
            # This would use browser automation to check application portals
            if application.external_url:
                # Use browser automation to check status
                # Implementation would navigate to application portal
                # and scrape status information
                pass
            
            return None
            
        except Exception as e:
            logger.error(f"Web status check failed: {e}")
            return None
    
    async def _process_status_update(self, application: Application, 
                                   status_data: Dict[str, Any]) -> None:
        """Process and save status updates"""
        try:
            new_status = None
            source = 'automated_check'
            notes = []
            
            # Determine new status based on multiple sources
            for source_type, data in status_data.items():
                if data and data.get('status'):
                    new_status = data['status']
                    source = f"{source_type}_sync"
                    notes.append(f"Status from {source_type}: {data.get('message', '')}")
            
            if new_status and new_status != application.status:
                # Update application status
                await sync_to_async(lambda: setattr(application, 'status', new_status))()
                await sync_to_async(application.save)()
                
                # Create status history
                await sync_to_async(ApplicationStatusHistory.objects.create)(
                    application=application,
                    status=new_status,
                    source=source,
                    notes='; '.join(notes),
                    updated_at=timezone.now()
                )
                
                # Trigger real-time update event
                await self._trigger_status_update_event(application.id, new_status, notes)
                
                # Update monitoring info
                if application.id in self.active_applications:
                    self.active_applications[application.id]['last_check'] = timezone.now()
                    self.active_applications[application.id]['status_updates'] += 1
                
        except Exception as e:
            logger.error(f"Status update processing failed: {e}")
    
    async def _trigger_status_update_event(self, application_id: int, 
                                          status: str, notes: List[str]) -> None:
        """Trigger real-time status update event"""
        try:
            # This would integrate with WebSocket or SSE for real-time updates
            event_data = {
                'application_id': application_id,
                'status': status,
                'notes': notes,
                'timestamp': timezone.now().isoformat()
            }
            
            # Log the event (in production, this would send to WebSocket clients)
            logger.info(f"Status update event: {event_data}")
            
        except Exception as e:
            logger.error(f"Failed to trigger status update event: {e}")
    
    async def _check_follow_up_opportunities(self, application_id: int) -> None:
        """Check for follow-up opportunities"""
        try:
            application = await sync_to_async(Application.objects.get)(id=application_id)
            
            # Check how long since application
            days_since_applied = (timezone.now() - application.applied_at).days
            
            # Generate follow-up suggestions based on time and status
            if application.status == 'applied' and days_since_applied >= 7:
                await self._suggest_follow_up(application, 'weekly_check')
            elif application.status == 'interview' and days_since_applied >= 3:
                await self._suggest_follow_up(application, 'interview_follow_up')
                
        except Exception as e:
            logger.error(f"Follow-up check failed for application {application_id}: {e}")
    
    async def _suggest_follow_up(self, application: Application, 
                                follow_up_type: str) -> None:
        """Generate follow-up suggestion"""
        try:
            suggestions = {
                'weekly_check': 'Consider sending a polite follow-up email to inquire about your application status',
                'interview_follow_up': 'Send a thank you note and check on the decision timeline'
            }
            
            suggestion = suggestions.get(follow_up_type, 'Follow up on your application')
            
            # This would create a follow-up task or notification
            logger.info(f"Follow-up suggestion for application {application.id}: {suggestion}")
            
        except Exception as e:
            logger.error(f"Follow-up suggestion failed: {e}")
    
    def _detect_ats_system(self, job: JobPosting) -> Optional[Dict]:
        """Detect which ATS system a job uses"""
        try:
            job_url = job.url.lower()
            
            if 'greenhouse' in job_url:
                return self.ats_mapping.get('greenhouse')
            elif 'lever' in job_url:
                return self.ats_mapping.get('lever')
            elif 'workday' in job_url:
                return self.ats_mapping.get('workday')
            
            return None
            
        except Exception as e:
            logger.error(f"ATS detection failed: {e}")
            return None
    
    def get_application_monitoring_status(self) -> Dict[str, Any]:
        """Get current monitoring status"""
        return {
            'active_applications': len(self.active_applications),
            'applications': dict(self.active_applications),
            'total_monitored': len(self.active_applications)
        }
    
    async def stop_application_monitoring(self, application_id: int) -> None:
        """Stop monitoring a specific application"""
        self.active_applications.pop(application_id, None)
    
    def apply_to_job(self, job: JobPosting, user_profile: UserProfile, method: Optional[str] = None) -> Dict[str, Any]:
        """
        Apply to a job using the most appropriate method.
        
        Args:
            job: JobPosting instance
            user_profile: UserProfile instance
            method: Override method ('API', 'Browser', 'Redirect'). If None, auto-detect.
            
        Returns:
            Dict containing application result
        """
        logger.info(f"Starting application process for job {job.id} ({job.title} at {job.company})")
        
        # Check if already applied
        existing_application = Application.objects.filter(
            job=job,
            user_profile=user_profile
        ).first()
        
        if existing_application:
            logger.warning(f"User {user_profile.full_name} has already applied to job {job.id}")
            return {
                'success': False,
                'error': 'Already applied to this job',
                'application_id': str(existing_application.application_id)
            }
        
        # Determine application method
        application_method = method or self._determine_application_method(job)
        
        # Create application record
        application = Application.objects.create(
            job=job,
            user_profile=user_profile,
            application_method=application_method,
            status=Application.ApplicationStatus.PENDING
        )
        
        try:
            # Route to appropriate application method
            if application_method == 'API':
                result = self._apply_via_api(job, user_profile)
            elif application_method == 'Browser':
                result = self._apply_via_browser(job, user_profile)
            elif application_method == 'Redirect':
                result = self._apply_via_redirect(job, user_profile)
            else:
                raise ValueError(f"Unknown application method: {application_method}")
            
            # Update application based on result
            self._update_application_from_result(application, result)
            
            # Add application ID to result
            result['application_id'] = str(application.application_id)
            
            logger.info(f"Application process completed for job {job.id}: {result['success']}")
            return result
            
        except Exception as e:
            error_msg = f"Unexpected error during application: {str(e)}"
            logger.error(error_msg)
            
            # Update application with error
            application.status = Application.ApplicationStatus.FAILED
            application.error_message = error_msg
            application.save()
            
            return {
                'success': False,
                'error': error_msg,
                'application_id': str(application.application_id)
            }
    
    def _determine_application_method(self, job: JobPosting) -> str:
        """
        Determine the best application method for a job based on its source and URL.
        
        Args:
            job: JobPosting instance
            
        Returns:
            str: Application method ('API', 'Browser', 'Redirect')
        """
        source = job.source.lower() if job.source else ''
        
        # Check if source has API support
        if source in self.ats_mapping:
            logger.info(f"Job source '{source}' supports API application")
            return 'API'
        
        # Use explicit apply_url when present
        nav_url = getattr(job, 'apply_url', None) or job.url
        # Check for redirect indicators
        if self._is_redirect_url(nav_url):
            logger.info(f"Job URL appears to be a redirect: {nav_url}")
            return 'Redirect'
        
        # Default to browser automation
        logger.info(f"Using browser automation for job {job.id}")
        return 'Browser'
    
    def _is_redirect_url(self, url: str) -> bool:
        """
        Check if a URL is likely to redirect to an external ATS.
        """
        if not url:
            return False
            
        redirect_indicators = [
            'redirect',
            'external',
            'apply.workable.com',
            'jobs.smartrecruiters.com',
            'careers-',
            '/goto/',
            '/redirect/'
        ]
        
        url_lower = url.lower()
        return any(indicator in url_lower for indicator in redirect_indicators)
    
    def _apply_via_api(self, job: JobPosting, user_profile: UserProfile) -> Dict[str, Any]:
        """
        Apply to job via ATS API.
        """
        source = job.source.lower() if job.source else ''
        
        if source not in self.ats_mapping:
            return {
                'success': False,
                'error': f"No API client available for source: {source}"
            }
        
        ats_config = self.ats_mapping[source]
        client = ats_config['client']
        
        logger.info(f"Applying via {source.upper()} API")
        return client.apply_via_api(job, user_profile)
    
    def _apply_via_browser(self, job: JobPosting, user_profile: UserProfile) -> Dict[str, Any]:
        """
        Apply to job via browser automation.
        """
        logger.info("Applying via browser automation")
        
        try:
            # Run browser automation in async context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # Prefer apply_url if set
            nav_job = job
            try:
                if getattr(job, 'apply_url', None):
                    setattr(nav_job, 'url', job.apply_url)
            except Exception:
                pass

            result = loop.run_until_complete(
                apply_with_browser(nav_job, user_profile, headless=True)
            )
            
            loop.close()
            
            # Convert browser result format to service result format
            return {
                'success': result.get('success', False),
                'confirmation_number': result.get('confirmation_number'),
                'error': result.get('error'),
                'screenshot_path': result.get('screenshot_path')
            }
            
        except Exception as e:
            error_msg = f"Browser automation failed: {str(e)}"
            logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg
            }
    
    def _apply_via_redirect(self, job: JobPosting, user_profile: UserProfile) -> Dict[str, Any]:
        """
        Apply to job via redirect URL handling.
        First tries to follow redirect, then falls back to browser automation.
        """
        logger.info("Applying via redirect handling")
        
        try:
            # Prefer explicit apply_url; else follow redirect to get actual application URL
            explicit = getattr(job, 'apply_url', None)
            actual_url = explicit or self._follow_redirect(job.url)
            
            if not actual_url:
                return {
                    'success': False,
                    'error': 'Could not resolve redirect URL'
                }
            
            # Create temporary job object with actual URL
            temp_job = JobPosting(
                id=job.id,
                external_id=job.external_id,
                title=job.title,
                company=job.company,
                location=job.location,
                description=job.description,
                url=actual_url,  # Use resolved URL
                source=job.source,
                date_posted=job.date_posted,
                is_active=job.is_active
            )
            
            # Try API first if redirect leads to known ATS
            resolved_method = self._determine_application_method(temp_job)
            
            if resolved_method == 'API':
                return self._apply_via_api(temp_job, user_profile)
            else:
                # Fall back to browser automation
                return self._apply_via_browser(temp_job, user_profile)
                
        except Exception as e:
            error_msg = f"Redirect handling failed: {str(e)}"
            logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg
            }
    
    def _follow_redirect(self, url: str) -> Optional[str]:
        """
        Follow redirect URL to get the actual application URL.
        """
        try:
            import requests
            
            response = requests.head(url, allow_redirects=True, timeout=10)
            actual_url = response.url
            
            logger.info(f"Redirect resolved: {url} -> {actual_url}")
            return actual_url
            
        except Exception as e:
            logger.error(f"Failed to follow redirect for {url}: {str(e)}")
            return None
    
    def _update_application_from_result(self, application: Application, result: Dict[str, Any]) -> None:
        """
        Update application record based on the result of application attempt.
        """
        if result['success']:
            application.status = Application.ApplicationStatus.APPLIED
            application.confirmation_number = result.get('confirmation_number')
            application.notes = f"Successfully applied via {application.application_method}"
        else:
            application.status = Application.ApplicationStatus.FAILED
            application.error_message = result.get('error', 'Unknown error')
            application.notes = f"Application failed via {application.application_method}"
        
        # Add screenshot path if available
        if result.get('screenshot_path'):
            application.notes += f"\nScreenshot: {result['screenshot_path']}"
        
    application.save()
    logger.info(f"Updated application {application.application_id} with status: {application.status}")


# Convenience function for use in management commands
async def apply_to_job(job: JobPosting, user_profile: UserProfile, method: Optional[str] = None) -> Dict[str, Any]:
    """
    Convenience function to apply to a job.
    
    Args:
        job: JobPosting instance
        user_profile: UserProfile instance
        method: Optional override for application method
        
    Returns:
        Dict containing application result
    """
    service = DynamicApplicationService()
    return await service.apply_dynamically(job.id, user_profile, {
        'auto_customize': True,
        'follow_external_links': True
    })


# Singleton instance for backwards compatibility
application_service = DynamicApplicationService()
