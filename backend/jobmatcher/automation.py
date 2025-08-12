"""
Automated Application System

Manages automated job applications with intelligent scheduling,
application pipeline tracking, and integration with ATS systems.

Features:
- Smart application scheduling
- Automated document submission
- Application status tracking
- Pipeline management
- Integration with jobapplier module
"""

import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from django.db import transaction
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from celery import shared_task

from jobscraper.models import JobPosting
from fyndr_auth.models import JobSeekerProfile, User
from jobapplier.models import JobApplication
from jobapplier.real_time_service import real_time_service
from .models import JobScore, PreparedJob, UserPreferences
from .ai_service import ai_service

logger = logging.getLogger(__name__)


class AutomatedApplicationManager:
    """
    Manages automated job application pipeline
    """
    
    def __init__(self):
        self.real_time_service = real_time_service
        self.daily_application_limit = 50  # Safety limit
        self.hourly_application_limit = 10  # Rate limiting
        
        # Application scheduling rules
        self.scheduling_rules = {
            'high_priority': {
                'min_score': 80,
                'max_daily': 15,
                'application_delay_minutes': 30,
                'preferred_hours': [9, 10, 11, 14, 15, 16]  # Business hours
            },
            'medium_priority': {
                'min_score': 60,
                'max_daily': 25,
                'application_delay_minutes': 60,
                'preferred_hours': [9, 10, 11, 12, 13, 14, 15, 16, 17]
            },
            'low_priority': {
                'min_score': 40,
                'max_daily': 10,
                'application_delay_minutes': 120,
                'preferred_hours': [10, 11, 12, 13, 14, 15, 16]
            }
        }
    
    def schedule_applications_for_user(self, user: User, preferences: UserPreferences) -> Dict:
        """
        Schedule automated applications based on user preferences and job scores
        """
        try:
            user_profile = user.jobseekerprofile
            
            # Check if automation is enabled
            if not preferences.automation_enabled:
                return {'success': False, 'message': 'Automation not enabled for user'}
            
            # Get ready job packets
            ready_packets = PreparedJob.objects.filter(
                user_profile=user_profile,
                packet_ready=True,
                application_status='not_applied'
            ).select_related('job')
            
            if not ready_packets.exists():
                return {'success': False, 'message': 'No ready job packets found'}
            
            # Categorize jobs by priority
            scheduled_jobs = {
                'high_priority': [],
                'medium_priority': [],
                'low_priority': []
            }
            
            for packet in ready_packets:
                job_score = JobScore.objects.filter(
                    job=packet.job,
                    user_profile=user_profile
                ).first()
                
                if not job_score:
                    continue
                
                # Determine priority based on score
                priority = self._determine_priority(job_score.score)
                
                # Check if job meets automation criteria
                if self._meets_automation_criteria(packet, job_score, preferences):
                    scheduled_jobs[priority].append({
                        'packet': packet,
                        'job_score': job_score,
                        'priority': priority
                    })
            
            # Schedule applications with intelligent timing
            schedule_result = self._create_application_schedule(scheduled_jobs, preferences)
            
            return {
                'success': True,
                'scheduled_applications': schedule_result['total_scheduled'],
                'schedule_details': schedule_result,
                'next_application_time': schedule_result.get('next_application_time')
            }
            
        except Exception as e:
            logger.error(f"Failed to schedule applications for user {user.id}: {e}")
            return {'success': False, 'error': str(e)}
    
    def _determine_priority(self, score: float) -> str:
        """Determine application priority based on job score"""
        if score >= 80:
            return 'high_priority'
        elif score >= 60:
            return 'medium_priority'
        else:
            return 'low_priority'
    
    def _meets_automation_criteria(self, packet: PreparedJob, job_score: JobScore, 
                                 preferences: UserPreferences) -> bool:
        """Check if job meets user's automation criteria"""
        try:
            # Check minimum score threshold
            if job_score.score < preferences.min_job_score_threshold:
                return False
            
            # Check job type preferences
            if preferences.preferred_job_types:
                job_title_lower = packet.job.title.lower()
                if not any(job_type.lower() in job_title_lower 
                          for job_type in preferences.preferred_job_types):
                    return False
            
            # Check location preferences
            if preferences.preferred_locations and packet.job.location:
                job_location = packet.job.location.lower()
                if not any(location.lower() in job_location 
                          for location in preferences.preferred_locations):
                    # Allow remote jobs
                    if 'remote' not in job_location:
                        return False
            
            # Check salary requirements
            if preferences.minimum_salary and packet.job.salary_min:
                if packet.job.salary_min < preferences.minimum_salary:
                    return False
            
            # Check company blacklist
            if preferences.excluded_companies:
                if packet.job.company.lower() in [
                    company.lower() for company in preferences.excluded_companies
                ]:
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error checking automation criteria: {e}")
            return False
    
    def _create_application_schedule(self, scheduled_jobs: Dict, 
                                   preferences: UserPreferences) -> Dict:
        """Create intelligent application schedule"""
        schedule = {
            'high_priority': [],
            'medium_priority': [],
            'low_priority': [],
            'total_scheduled': 0,
            'schedule_created_at': timezone.now().isoformat()
        }
        
        current_time = timezone.now()
        next_application_time = current_time
        
        # Process each priority level
        for priority, jobs in scheduled_jobs.items():
            if not jobs:
                continue
            
            rules = self.scheduling_rules[priority]
            max_for_priority = min(rules['max_daily'], len(jobs))
            delay_minutes = rules['application_delay_minutes']
            
            scheduled_count = 0
            for job_data in jobs[:max_for_priority]:
                # Calculate next application time
                next_application_time = self._find_next_available_slot(
                    next_application_time, delay_minutes, rules['preferred_hours']
                )
                
                # Create schedule entry
                schedule_entry = {
                    'prepared_job_id': job_data['packet'].id,
                    'job_id': job_data['packet'].job.id,
                    'job_title': job_data['packet'].job.title,
                    'company': job_data['packet'].job.company,
                    'score': job_data['job_score'].score,
                    'scheduled_time': next_application_time.isoformat(),
                    'priority': priority,
                    'status': 'scheduled'
                }
                
                schedule[priority].append(schedule_entry)
                scheduled_count += 1
                
                # Update prepared job with schedule
                job_data['packet'].application_status = 'scheduled'
                job_data['packet'].save()
                
                # Move to next time slot
                next_application_time += timedelta(minutes=delay_minutes)
            
            schedule['total_scheduled'] += scheduled_count
        
        # Set next application time
        if schedule['total_scheduled'] > 0:
            schedule['next_application_time'] = min([
                entry['scheduled_time'] 
                for priority_jobs in [schedule['high_priority'], schedule['medium_priority'], schedule['low_priority']]
                for entry in priority_jobs
            ])
        
        return schedule
    
    def _find_next_available_slot(self, current_time: datetime, delay_minutes: int, 
                                preferred_hours: List[int]) -> datetime:
        """Find next available time slot within business hours"""
        candidate_time = current_time + timedelta(minutes=delay_minutes)
        
        # Ensure it's within preferred hours (weekdays only)
        while (candidate_time.weekday() >= 5 or  # Weekend
               candidate_time.hour not in preferred_hours):
            
            if candidate_time.weekday() >= 5:  # Weekend
                # Move to next Monday
                days_ahead = 7 - candidate_time.weekday()
                candidate_time = candidate_time.replace(
                    hour=preferred_hours[0], minute=0, second=0, microsecond=0
                ) + timedelta(days=days_ahead)
            else:
                # Move to next preferred hour
                if candidate_time.hour < min(preferred_hours):
                    candidate_time = candidate_time.replace(
                        hour=min(preferred_hours), minute=0, second=0, microsecond=0
                    )
                elif candidate_time.hour > max(preferred_hours):
                    candidate_time = candidate_time.replace(
                        hour=min(preferred_hours), minute=0, second=0, microsecond=0
                    ) + timedelta(days=1)
                else:
                    # Find next preferred hour
                    next_hour = min([h for h in preferred_hours if h > candidate_time.hour])
                    candidate_time = candidate_time.replace(
                        hour=next_hour, minute=0, second=0, microsecond=0
                    )
        
        return candidate_time
    
    def execute_scheduled_applications(self) -> Dict:
        """
        Execute applications that are scheduled for now
        """
        try:
            current_time = timezone.now()
            
            # Find applications scheduled for execution
            due_applications = PreparedJob.objects.filter(
                application_status='scheduled',
                packet_ready=True
            ).select_related('job', 'user_profile__user')
            
            results = {
                'total_processed': 0,
                'successful_applications': 0,
                'failed_applications': 0,
                'errors': []
            }
            
            for prepared_job in due_applications:
                try:
                    # Check if it's time to apply
                    # Note: In real implementation, you'd store scheduled_time in the model
                    # For now, we'll apply if the job has been scheduled
                    
                    # Execute the application
                    application_result = self._execute_single_application(prepared_job)
                    
                    if application_result['success']:
                        results['successful_applications'] += 1
                        prepared_job.application_status = 'applied'
                        prepared_job.save()
                        
                        # Create application record via real-time service
                        application_data = {
                            'method': 'automated',
                            'notes': f"Automated application with {prepared_job.job.title}"
                        }
                        application = self.real_time_service.create_application_with_tracking(
                            user=prepared_job.user_profile.user,
                            job=prepared_job.job,
                            application_data=application_data
                        )
                        
                    else:
                        results['failed_applications'] += 1
                        results['errors'].append(application_result['error'])
                        prepared_job.application_status = 'failed'
                        prepared_job.save()
                    
                    results['total_processed'] += 1
                    
                except Exception as e:
                    logger.error(f"Failed to execute application for job {prepared_job.job.id}: {e}")
                    results['failed_applications'] += 1
                    results['errors'].append(str(e))
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to execute scheduled applications: {e}")
            return {'error': str(e)}
    
    def _execute_single_application(self, prepared_job: PreparedJob) -> Dict:
        """Execute a single job application"""
        try:
            # Get job score for additional context
            job_score = JobScore.objects.filter(
                job=prepared_job.job,
                user_profile=prepared_job.user_profile
            ).first()
            
            # Prepare application data
            application_data = {
                'job_posting': prepared_job.job,
                'user_profile': prepared_job.user_profile,
                'tailored_resume': prepared_job.tailored_resume,
                'cover_letter': prepared_job.tailored_cover_letter,
                'job_score': job_score.score if job_score else 0,
                'ai_insights': job_score.ai_reasoning if job_score else ""
            }
            
            # Use the real-time service to create application
            try:
                application = self.real_time_service.create_application_with_tracking(
                    user=prepared_job.user_profile.user,
                    job=prepared_job.job,
                    application_data={
                        'method': 'automated',
                        'resume_text': prepared_job.tailored_resume,
                        'cover_letter_text': prepared_job.tailored_cover_letter,
                        'notes': f"Automated application - Score: {job_score.score if job_score else 0}"
                    }
                )
                result = {'success': True, 'application_id': str(application.id)}
            except Exception as e:
                result = {'success': False, 'error': str(e)}
            
            # Send notification to user
            if result.get('success'):
                self._send_application_notification(prepared_job, 'success')
            else:
                self._send_application_notification(prepared_job, 'failed', result.get('error'))
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to execute single application: {e}")
            return {'success': False, 'error': str(e)}
    
    def _send_application_notification(self, prepared_job: PreparedJob, 
                                     status: str, error: str = None):
        """Send notification to user about application status"""
        try:
            user = prepared_job.user_profile.user
            job = prepared_job.job
            
            if status == 'success':
                subject = f"✅ Application Submitted: {job.title} at {job.company}"
                message = f"""
                Your application has been successfully submitted!
                
                Job: {job.title}
                Company: {job.company}
                Location: {job.location or 'Not specified'}
                
                Your tailored resume and cover letter have been submitted automatically.
                
                Good luck with your application!
                """
            else:
                subject = f"❌ Application Failed: {job.title} at {job.company}"
                message = f"""
                We encountered an issue submitting your application.
                
                Job: {job.title}
                Company: {job.company}
                Error: {error or 'Unknown error occurred'}
                
                Please review and apply manually if needed.
                """
            
            # Send email notification if enabled
            if hasattr(settings, 'EMAIL_NOTIFICATIONS_ENABLED') and settings.EMAIL_NOTIFICATIONS_ENABLED:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True
                )
            
        except Exception as e:
            logger.error(f"Failed to send application notification: {e}")
    
    def get_application_pipeline_status(self, user: User) -> Dict:
        """Get comprehensive pipeline status for user"""
        try:
            user_profile = user.jobseekerprofile
            
            # Get application statistics
            total_jobs = JobPosting.objects.count()
            scored_jobs = JobScore.objects.filter(user_profile=user_profile).count()
            ready_packets = PreparedJob.objects.filter(
                user_profile=user_profile,
                packet_ready=True
            ).count()
            
            # Get recent applications
            recent_applications = JobApplication.objects.filter(
                user=user
            ).order_by('-applied_at')[:10]
            
            # Get automation settings
            preferences = UserPreferences.objects.filter(user_profile=user_profile).first()
            
            return {
                'pipeline_overview': {
                    'total_jobs_available': total_jobs,
                    'jobs_scored': scored_jobs,
                    'packets_ready': ready_packets,
                    'applications_submitted': recent_applications.count()
                },
                'automation_status': {
                    'enabled': preferences.automation_enabled if preferences else False,
                    'daily_limit': preferences.daily_application_limit if preferences else 0,
                    'min_score_threshold': preferences.min_job_score_threshold if preferences else 0
                },
                'recent_applications': [
                    {
                        'job_title': app.job.title,
                        'company': app.job.company,
                        'date': app.applied_at.isoformat(),
                        'status': app.status,
                        'method': app.application_method
                    }
                    for app in recent_applications
                ],
                'next_actions': self._get_next_actions(user_profile, preferences)
            }
            
        except Exception as e:
            logger.error(f"Failed to get pipeline status for user {user.id}: {e}")
            return {'error': str(e)}
    
    def _get_next_actions(self, user_profile: JobSeekerProfile, 
                         preferences: Optional[UserPreferences]) -> List[str]:
        """Get recommended next actions for user"""
        actions = []
        
        # Check if profile is complete
        if not user_profile.bio or not user_profile.skills:
            actions.append("Complete your profile with bio and skills")
        
        # Check if preferences are set
        if not preferences:
            actions.append("Set up automation preferences")
        
        # Check for unscored jobs
        unscored_count = JobPosting.objects.count() - JobScore.objects.filter(
            user_profile=user_profile
        ).count()
        
        if unscored_count > 0:
            actions.append(f"Score {unscored_count} remaining jobs")
        
        # Check for unprepared packets
        high_score_jobs = JobScore.objects.filter(
            user_profile=user_profile,
            score__gte=70
        ).count()
        
        ready_packets = PreparedJob.objects.filter(
            user_profile=user_profile,
            packet_ready=True
        ).count()
        
        if high_score_jobs > ready_packets:
            actions.append(f"Prepare {high_score_jobs - ready_packets} high-scoring job packets")
        
        return actions


# Singleton instance
automation_manager = AutomatedApplicationManager()


# Celery tasks for automation
@shared_task
def execute_scheduled_applications():
    """Celery task to execute scheduled applications"""
    try:
        results = automation_manager.execute_scheduled_applications()
        logger.info(f"Executed scheduled applications: {results}")
        return results
    except Exception as e:
        logger.error(f"Failed to execute scheduled applications: {e}")
        return {'error': str(e)}


@shared_task
def schedule_daily_applications():
    """Celery task to schedule daily applications for all users"""
    try:
        from django.contrib.auth.models import User
        
        results = {'total_users': 0, 'successful_schedules': 0, 'errors': []}
        
        # Get all users with automation enabled
        automation_users = User.objects.filter(
            jobseekerprofile__userpreferences__automation_enabled=True
        ).distinct()
        
        for user in automation_users:
            try:
                preferences = UserPreferences.objects.filter(
                    user_profile=user.jobseekerprofile
                ).first()
                
                if preferences:
                    schedule_result = automation_manager.schedule_applications_for_user(
                        user, preferences
                    )
                    
                    if schedule_result.get('success'):
                        results['successful_schedules'] += 1
                    else:
                        results['errors'].append(f"User {user.id}: {schedule_result.get('message')}")
                
                results['total_users'] += 1
                
            except Exception as e:
                results['errors'].append(f"User {user.id}: {str(e)}")
        
        logger.info(f"Daily application scheduling completed: {results}")
        return results
        
    except Exception as e:
        logger.error(f"Failed to schedule daily applications: {e}")
        return {'error': str(e)}


# Convenience functions
def enable_automation_for_user(user: User, preferences_data: Dict) -> Dict:
    """Enable automation for a user with given preferences"""
    try:
        user_profile = user.jobseekerprofile
        
        # Create or update preferences
        preferences, created = UserPreferences.objects.get_or_create(
            user_profile=user_profile,
            defaults=preferences_data
        )
        
        if not created:
            for key, value in preferences_data.items():
                setattr(preferences, key, value)
            preferences.save()
        
        # Schedule initial applications
        schedule_result = automation_manager.schedule_applications_for_user(
            user, preferences
        )
        
        return {
            'success': True,
            'preferences_updated': True,
            'schedule_result': schedule_result
        }
        
    except Exception as e:
        logger.error(f"Failed to enable automation for user {user.id}: {e}")
        return {'success': False, 'error': str(e)}


def get_automation_dashboard(user: User) -> Dict:
    """Get comprehensive automation dashboard data"""
    try:
        pipeline_status = automation_manager.get_application_pipeline_status(user)
        
        # Add AI enhancement statistics
        user_profile = user.jobseekerprofile
        ai_enhanced_packets = PreparedJob.objects.filter(
            user_profile=user_profile,
            ai_customization_notes__isnull=False
        ).count()
        
        pipeline_status['ai_enhancements'] = {
            'ai_enhanced_packets': ai_enhanced_packets,
            'ai_service_available': ai_service.ai_enabled
        }
        
        return pipeline_status
        
    except Exception as e:
        logger.error(f"Failed to get automation dashboard for user {user.id}: {e}")
        return {'error': str(e)}
