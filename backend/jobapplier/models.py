import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from jobscraper.models import JobPosting

User = get_user_model()


class JobApplication(models.Model):
    """
    Job application model to track job applications with real-time features
    """
    
    class ApplicationMethod(models.TextChoices):
        API = 'api', 'API'
        BROWSER = 'browser', 'Browser Automation'
        MANUAL = 'manual', 'Manual Application'
        REDIRECT = 'redirect', 'External Redirect'
    
    class ApplicationStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPLIED = 'applied', 'Applied'
        IN_REVIEW = 'in_review', 'In Review'
        INTERVIEW = 'interview', 'Interview Scheduled'
        REJECTED = 'rejected', 'Rejected'
        OFFER = 'offer', 'Offer Received'
        ACCEPTED = 'accepted', 'Offer Accepted'
        DECLINED = 'declined', 'Offer Declined'
        WITHDRAWN = 'withdrawn', 'Application Withdrawn'
        FAILED = 'failed', 'Application Failed'
    
    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='applications')
    
    # Application details
    status = models.CharField(max_length=20, choices=ApplicationStatus.choices, default=ApplicationStatus.PENDING)
    application_method = models.CharField(max_length=20, choices=ApplicationMethod.choices, default=ApplicationMethod.MANUAL)
    external_application_id = models.CharField(max_length=500, blank=True, null=True)
    application_url = models.URLField(blank=True, null=True)
    
    # Application data
    resume_text = models.TextField(blank=True, help_text="Resume content used for this application")
    cover_letter_text = models.TextField(blank=True, help_text="Cover letter content used")
    custom_answers = models.JSONField(default=dict, blank=True, help_text="Custom answers to application questions")
    
    # Tracking and automation
    automation_log = models.JSONField(default=list, blank=True, help_text="Log of automation steps")
    ats_response = models.JSONField(default=dict, blank=True, help_text="Response from ATS system")
    notes = models.TextField(blank=True, help_text="Internal notes")

    # Verification and email confirmations
    is_verified = models.BooleanField(default=False, help_text="Application verified against ATS or email")
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_source = models.CharField(max_length=50, blank=True, help_text="Source of verification: ats|email|manual")
    email_confirmed = models.BooleanField(default=False, help_text="Received confirmation email")
    email_confirmed_at = models.DateTimeField(null=True, blank=True)
    
    # Real-time tracking
    is_tracking_enabled = models.BooleanField(default=True)
    last_status_check = models.DateTimeField(null=True, blank=True)
    status_updates = models.JSONField(default=list, blank=True)
    
    # Timestamps
    applied_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'jobapplier_application'
        ordering = ['-applied_at']
        unique_together = ['user', 'job']
    
    def __str__(self):
        return f"{self.user.username} -> {self.job.title} at {self.job.company}"


class ApplicationEvent(models.Model):
    """
    Track events and status changes for applications
    """
    
    class EventType(models.TextChoices):
        APPLIED = 'applied', 'Application Submitted'
        STATUS_CHANGE = 'status_change', 'Status Changed'
        EMAIL_RECEIVED = 'email_received', 'Email Received'
        INTERVIEW_SCHEDULED = 'interview_scheduled', 'Interview Scheduled'
        FOLLOW_UP = 'follow_up', 'Follow Up'
        REJECTION = 'rejection', 'Rejection Received'
        OFFER = 'offer', 'Offer Received'
        WITHDRAWN = 'withdrawn', 'Application Withdrawn'
        NOTE_ADDED = 'note_added', 'Note Added'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=30, choices=EventType.choices)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'jobapplier_event'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.event_type} - {self.application}"


class RealTimeConnection(models.Model):
    """
    Track active real-time WebSocket connections
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='realtime_connections')
    channel_name = models.CharField(max_length=500, unique=True)
    connected_at = models.DateTimeField(auto_now_add=True)
    last_ping = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'jobapplier_realtime_connection'
    
    def __str__(self):
        return f"RealTime: {self.user.username} - {self.channel_name}"


class ApplicationTracking(models.Model):
    """
    Track application status with external systems
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.OneToOneField(JobApplication, on_delete=models.CASCADE, related_name='tracking')
    
    # External tracking data
    ats_system = models.CharField(max_length=100, blank=True)
    external_tracking_id = models.CharField(max_length=500, blank=True)
    tracking_url = models.URLField(blank=True, null=True)
    
    # Status monitoring
    last_checked = models.DateTimeField(auto_now=True)
    check_frequency_minutes = models.IntegerField(default=60)
    next_check = models.DateTimeField(null=True, blank=True)
    
    # Email monitoring
    email_monitoring_enabled = models.BooleanField(default=False)
    email_keywords = models.JSONField(default=list, blank=True)
    
    # Tracking results
    tracking_data = models.JSONField(default=dict, blank=True)
    status_history = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'jobapplier_tracking'
    
    def __str__(self):
        return f"Tracking: {self.application}"
