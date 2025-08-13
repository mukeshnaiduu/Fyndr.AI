"""
Follow-up and reminder system for job applications.

This module handles automatic follow-up detection and reminder generation
for pending applications and status tracking.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

from django.utils import timezone
from django.db.models import Q

logger = logging.getLogger(__name__)


@dataclass
class FollowUpTask:
    """Data class representing a follow-up task."""
    application_id: str
    job_title: str
    company: str
    applied_date: datetime
    days_pending: int
    task_type: str
    priority: str
    suggested_action: str
    notes: str = ""


@dataclass
class ReminderConfig:
    """Configuration for reminder timing and thresholds."""
    initial_follow_up_days: int = 7
    second_follow_up_days: int = 14
    final_follow_up_days: int = 21
    stale_application_days: int = 30
    interview_follow_up_days: int = 3
    offer_response_days: int = 7


class ApplicationReminderSystem:
    """
    System for managing follow-ups and reminders for job applications.
    """
    
    def __init__(self, config: ReminderConfig = None):
        self.config = config or ReminderConfig()
        self.logger = logging.getLogger(__name__)
    
    def check_pending_applications(self, user_profile=None) -> List[FollowUpTask]:
        """
        Find applications that need follow-up action.
        
        Args:
            user_profile: UserProfile to check (None for all users)
            
        Returns:
            List of FollowUpTask objects requiring attention
        """
        try:
            from jobapplier.models import Application
            
            follow_up_tasks = []
            now = timezone.now()
            
            # Base queryset
            queryset = Application.objects.select_related('job', 'user_profile')
            if user_profile:
                queryset = queryset.filter(user_profile=user_profile)
            
            # Find applications in "applied" status for too long
            stale_applications = queryset.filter(
                status='applied',
                applied_at__lte=now - timedelta(days=self.config.initial_follow_up_days)
            )
            
            for app in stale_applications:
                days_pending = (now - app.applied_at).days
                task = self._create_follow_up_task(app, days_pending, now)
                if task:
                    follow_up_tasks.append(task)
            
            # Find interview responses that are overdue
            interview_follow_ups = queryset.filter(
                status='interview',
                updated_at__lte=now - timedelta(days=self.config.interview_follow_up_days)
            )
            
            for app in interview_follow_ups:
                days_pending = (now - app.updated_at).days
                task = FollowUpTask(
                    application_id=str(app.application_id),
                    job_title=app.job.title,
                    company=app.job.company,
                    applied_date=app.applied_at,
                    days_pending=days_pending,
                    task_type='interview_follow_up',
                    priority='high',
                    suggested_action='Follow up on interview status',
                    notes=f"Interview status pending for {days_pending} days"
                )
                follow_up_tasks.append(task)
            
            # Find offers awaiting response
            offer_responses = queryset.filter(
                status='offer',
                updated_at__lte=now - timedelta(days=self.config.offer_response_days)
            )
            
            for app in offer_responses:
                days_pending = (now - app.updated_at).days
                task = FollowUpTask(
                    application_id=str(app.application_id),
                    job_title=app.job.title,
                    company=app.job.company,
                    applied_date=app.applied_at,
                    days_pending=days_pending,
                    task_type='offer_response',
                    priority='urgent',
                    suggested_action='Respond to job offer',
                    notes=f"Offer response overdue by {days_pending} days"
                )
                follow_up_tasks.append(task)
            
            # Sort by priority and days pending
            priority_order = {'urgent': 0, 'high': 1, 'medium': 2, 'low': 3}
            follow_up_tasks.sort(key=lambda x: (priority_order.get(x.priority, 3), -x.days_pending))
            
            self.logger.info(f"Found {len(follow_up_tasks)} follow-up tasks")
            return follow_up_tasks
            
        except Exception as e:
            self.logger.error(f"Error checking pending applications: {e}")
            return []
    
    def _create_follow_up_task(self, application, days_pending: int, now: datetime) -> Optional[FollowUpTask]:
        """
        Create appropriate follow-up task based on application timing.
        
        Args:
            application: Application model instance
            days_pending: Number of days since application
            now: Current datetime
            
        Returns:
            FollowUpTask or None if no action needed
        """
        if days_pending >= self.config.stale_application_days:
            # Application is very old, suggest marking as stale
            return FollowUpTask(
                application_id=str(application.application_id),
                job_title=application.job.title,
                company=application.job.company,
                applied_date=application.applied_at,
                days_pending=days_pending,
                task_type='stale_application',
                priority='low',
                suggested_action='Mark as withdrawn or follow up',
                notes=f"No response for {days_pending} days - consider withdrawing"
            )
        elif days_pending >= self.config.final_follow_up_days:
            # Final follow-up
            return FollowUpTask(
                application_id=str(application.application_id),
                job_title=application.job.title,
                company=application.job.company,
                applied_date=application.applied_at,
                days_pending=days_pending,
                task_type='final_follow_up',
                priority='medium',
                suggested_action='Send final follow-up email',
                notes=f"Final follow-up after {days_pending} days"
            )
        elif days_pending >= self.config.second_follow_up_days:
            # Second follow-up
            return FollowUpTask(
                application_id=str(application.application_id),
                job_title=application.job.title,
                company=application.job.company,
                applied_date=application.applied_at,
                days_pending=days_pending,
                task_type='second_follow_up',
                priority='medium',
                suggested_action='Send second follow-up email',
                notes=f"Second follow-up after {days_pending} days"
            )
        elif days_pending >= self.config.initial_follow_up_days:
            # Initial follow-up
            return FollowUpTask(
                application_id=str(application.application_id),
                job_title=application.job.title,
                company=application.job.company,
                applied_date=application.applied_at,
                days_pending=days_pending,
                task_type='initial_follow_up',
                priority='high',
                suggested_action='Send initial follow-up email',
                notes=f"Initial follow-up after {days_pending} days"
            )
        
        return None
    
    def generate_follow_up_email_template(self, task: FollowUpTask) -> Dict[str, str]:
        """
        Generate email template for follow-up communications.
        
        Args:
            task: FollowUpTask with application details
            
        Returns:
            Dict with subject and body templates
        """
        templates = {
            'initial_follow_up': {
                'subject': f'Following up on {task.job_title} application',
                'body': f"""Dear Hiring Manager,

I hope this email finds you well. I wanted to follow up on my application for the {task.job_title} position at {task.company}, which I submitted on {task.applied_date.strftime('%B %d, %Y')}.

I remain very interested in this opportunity and would welcome the chance to discuss how my skills and experience align with your team's needs.

If you need any additional information or have questions about my application, please don't hesitate to reach out.

Thank you for your time and consideration.

Best regards,
[Your Name]"""
            },
            'second_follow_up': {
                'subject': f'Second follow-up: {task.job_title} position',
                'body': f"""Dear Hiring Manager,

I hope you're doing well. I'm writing to follow up once more on my application for the {task.job_title} position at {task.company}.

I submitted my application on {task.applied_date.strftime('%B %d, %Y')} and sent an initial follow-up email last week. I understand you likely receive many applications, but I wanted to reiterate my strong interest in this role.

Would it be possible to get an update on the status of my application or the expected timeline for the hiring process?

I appreciate your time and look forward to hearing from you.

Best regards,
[Your Name]"""
            },
            'final_follow_up': {
                'subject': f'Final follow-up regarding {task.job_title} application',
                'body': f"""Dear Hiring Manager,

I hope this message finds you well. This will be my final follow-up regarding my application for the {task.job_title} position at {task.company}, submitted on {task.applied_date.strftime('%B %d, %Y')}.

I understand that hiring processes can take time and that you may have moved forward with other candidates. If the position is still open and under consideration, I remain very interested and available to discuss my qualifications.

If you've decided to pursue other candidates, I completely understand and would appreciate any feedback you might be able to share.

Thank you again for considering my application.

Best regards,
[Your Name]"""
            },
            'interview_follow_up': {
                'subject': f'Thank you for the interview - {task.job_title}',
                'body': f"""Dear [Interviewer Name],

Thank you for taking the time to interview me for the {task.job_title} position at {task.company}. I enjoyed our conversation and learning more about the role and your team.

Our discussion reinforced my enthusiasm for this opportunity, and I'm excited about the possibility of contributing to [specific project/goal mentioned in interview].

I wanted to follow up to see if you need any additional information from me or if there are next steps in the process I should be aware of.

Thank you again for your time and consideration.

Best regards,
[Your Name]"""
            }
        }
        
        return templates.get(task.task_type, templates['initial_follow_up'])
    
    def create_reminder_notifications(self, tasks: List[FollowUpTask]) -> List[Dict[str, Any]]:
        """
        Create notification objects for reminder system.
        
        Args:
            tasks: List of FollowUpTask objects
            
        Returns:
            List of notification dictionaries
        """
        notifications = []
        
        for task in tasks:
            notification = {
                'type': 'follow_up_reminder',
                'priority': task.priority,
                'title': f'Follow up on {task.job_title} at {task.company}',
                'message': task.suggested_action,
                'application_id': task.application_id,
                'task_type': task.task_type,
                'days_pending': task.days_pending,
                'created_at': timezone.now().isoformat(),
                'metadata': {
                    'job_title': task.job_title,
                    'company': task.company,
                    'applied_date': task.applied_date.isoformat(),
                    'notes': task.notes
                }
            }
            notifications.append(notification)
        
        return notifications


def check_pending_applications(user_profile=None) -> List[FollowUpTask]:
    """
    Convenience function to check for applications needing follow-up.
    
    Args:
        user_profile: UserProfile to check (None for all users)
        
    Returns:
        List of FollowUpTask objects
    """
    reminder_system = ApplicationReminderSystem()
    return reminder_system.check_pending_applications(user_profile)


def generate_daily_reminder_report(user_profile=None) -> Dict[str, Any]:
    """
    Generate a daily summary report of follow-up tasks.
    
    Args:
        user_profile: UserProfile to check (None for all users)
        
    Returns:
        Dict with summary statistics and task details
    """
    tasks = check_pending_applications(user_profile)
    
    # Categorize tasks by priority and type
    by_priority = {'urgent': [], 'high': [], 'medium': [], 'low': []}
    by_type = {}
    
    for task in tasks:
        by_priority[task.priority].append(task)
        
        if task.task_type not in by_type:
            by_type[task.task_type] = []
        by_type[task.task_type].append(task)
    
    return {
        'summary': {
            'total_tasks': len(tasks),
            'urgent_tasks': len(by_priority['urgent']),
            'high_priority_tasks': len(by_priority['high']),
            'medium_priority_tasks': len(by_priority['medium']),
            'low_priority_tasks': len(by_priority['low'])
        },
        'by_priority': by_priority,
        'by_type': by_type,
        'generated_at': timezone.now().isoformat()
    }


def send_slack_notification(task: FollowUpTask) -> bool:
    """
    TODO: Send Slack notification for follow-up reminders.
    
    This function should:
    1. Format task information for Slack
    2. Use Slack Web API to send message
    3. Handle authentication and error cases
    4. Return success/failure status
    
    Args:
        task: FollowUpTask to send notification for
        
    Returns:
        Boolean indicating success
    """
    logger.info(f"Slack notification not yet implemented for task: {task.application_id}")
    
    # TODO: Implement Slack integration
    # Example implementation:
    # slack_client = WebClient(token=os.environ["SLACK_BOT_TOKEN"])
    # message = f"⏰ Follow-up reminder: {task.job_title} at {task.company}"
    # slack_client.chat_postMessage(channel="#job-search", text=message)
    
    return False


def send_email_reminder(task: FollowUpTask, user_email: str) -> bool:
    """
    TODO: Send email reminder for follow-up tasks.
    
    This function should:
    1. Generate email template
    2. Use email service (SendGrid, SES, etc.)
    3. Send formatted reminder email
    4. Handle delivery confirmation
    
    Args:
        task: FollowUpTask to send reminder for
        user_email: Email address to send reminder to
        
    Returns:
        Boolean indicating success
    """
    logger.info(f"Email reminder not yet implemented for task: {task.application_id}")
    
    # TODO: Implement email integration
    # template = generate_follow_up_email_template(task)
    # send_email(to=user_email, subject=template['subject'], body=template['body'])
    
    return False


# Example usage and testing
if __name__ == "__main__":
    # Test reminder system
    reminder_system = ApplicationReminderSystem()
    
    # Check for pending applications (this would normally use real data)
    tasks = reminder_system.check_pending_applications()
    
    print(f"Found {len(tasks)} follow-up tasks:")
    for task in tasks:
        print(f"  - {task.job_title} at {task.company} ({task.priority}) - {task.suggested_action}")
    
    # Generate daily report
    report = generate_daily_reminder_report()
    print(f"\nDaily report: {report['summary']}")
