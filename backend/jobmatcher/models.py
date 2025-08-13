from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User
from jobscraper.models import JobPosting
from fyndr_auth.models import JobSeekerProfile
import uuid


class JobScore(models.Model):
    """
    AI-powered job scoring system that matches jobs to user profiles
    """
    MATCH_STATUS_CHOICES = [
        ('HIGH', 'High Match (80-100%)'),
        ('MEDIUM', 'Medium Match (50-79%)'),
        ('LOW', 'Low Match (0-49%)'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(
        JobPosting, 
        on_delete=models.CASCADE,
        related_name='job_scores',
        help_text="The job being scored"
    )
    user_profile = models.ForeignKey(
        JobSeekerProfile, 
        on_delete=models.CASCADE,
        related_name='job_scores',
        help_text="The user profile for scoring comparison"
    )
    score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Match score percentage (0-100)"
    )
    match_status = models.CharField(
        max_length=10,
        choices=MATCH_STATUS_CHOICES,
        help_text="Categorized match level based on score"
    )
    skills_matched = models.JSONField(
        default=list,
        help_text="List of skills from user profile that match job requirements"
    )
    keywords_missed = models.JSONField(
        default=list,
        help_text="List of required skills/keywords that user is missing"
    )
    scored_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When this job was scored for this user"
    )
    
    # AI Enhancement fields for future implementation
    embedding_similarity = models.FloatField(
        null=True, 
        blank=True,
        help_text="Future: Semantic similarity score using AI embeddings"
    )
    ai_reasoning = models.TextField(
        blank=True,
        help_text="Future: AI-generated explanation for the score"
    )
    
    class Meta:
        unique_together = ['job', 'user_profile']
        ordering = ['-score', '-scored_at']
        indexes = [
            models.Index(fields=['user_profile', '-score']),
            models.Index(fields=['match_status', '-scored_at']),
            models.Index(fields=['score']),
        ]
    
    def __str__(self):
        return f"{self.job.title} - {self.user_profile.user.first_name} ({self.score}%)"
    
    def save(self, *args, **kwargs):
        # Auto-set match_status based on score
        if self.score >= 80:
            self.match_status = 'HIGH'
        elif self.score >= 50:
            self.match_status = 'MEDIUM'
        else:
            self.match_status = 'LOW'
        super().save(*args, **kwargs)
    
    @property
    def match_percentage(self):
        """Return score as a percentage string"""
        return f"{self.score:.1f}%"
    
    @property
    def skills_match_rate(self):
        """Calculate percentage of user skills that match job requirements"""
        if not self.skills_matched:
            return 0
        total_skills = len(self.skills_matched) + len(self.keywords_missed)
        if total_skills == 0:
            return 0
        return (len(self.skills_matched) / total_skills) * 100


class PreparedJob(models.Model):
    """
    Job packets with tailored documents ready for automated application
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(
        JobPosting, 
        on_delete=models.CASCADE,
        related_name='prepared_jobs',
        help_text="The job for which documents are prepared"
    )
    user_profile = models.ForeignKey(
        JobSeekerProfile, 
        on_delete=models.CASCADE,
        related_name='prepared_jobs',
        help_text="The user profile for document tailoring"
    )
    
    # Tailored Documents
    tailored_resume = models.FileField(
        upload_to='tailored_resumes/',
        null=True,
        blank=True,
        help_text="AI-tailored resume for this specific job"
    )
    tailored_cover_letter = models.FileField(
        upload_to='tailored_cover_letters/',
        null=True,
        blank=True,
        help_text="AI-generated cover letter for this specific job"
    )
    
    # Scoring and Status
    score = models.FloatField(
        help_text="Job score from JobScore model (cached for quick access)"
    )
    packet_ready = models.BooleanField(
        default=False,
        help_text="Whether all documents are prepared and ready for application"
    )
    packet_created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When this job packet was created"
    )
    last_updated = models.DateTimeField(
        auto_now=True,
        help_text="When this packet was last modified"
    )
    
    # Application Status Integration
    applied = models.BooleanField(
        default=False,
        help_text="Whether this job packet has been used for application"
    )
    applied_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When application was submitted using this packet"
    )
    
    # AI Enhancement fields for future implementation
    ai_customization_notes = models.TextField(
        blank=True,
        help_text="Future: AI notes on what customizations were made"
    )
    confidence_score = models.FloatField(
        null=True,
        blank=True,
        help_text="Future: AI confidence in the document tailoring quality"
    )
    
    class Meta:
        unique_together = ['job', 'user_profile']
        ordering = ['-score', '-packet_created_at']
        indexes = [
            models.Index(fields=['user_profile', '-score']),
            models.Index(fields=['packet_ready', '-packet_created_at']),
            models.Index(fields=['applied', '-applied_at']),
        ]
    
    def __str__(self):
        status = "✓ Ready" if self.packet_ready else "⏳ Preparing"
        return f"{self.job.title} - {self.user_profile.user.first_name} ({status})"
    
    @property
    def documents_ready(self):
        """Check if both resume and cover letter are prepared"""
        return bool(self.tailored_resume and self.tailored_cover_letter)
    
    @property
    def completion_status(self):
        """Get human-readable completion status"""
        if self.applied:
            return "Applied"
        elif self.packet_ready:
            return "Ready to Apply"
        elif self.tailored_resume and self.tailored_cover_letter:
            return "Documents Prepared"
        elif self.tailored_resume or self.tailored_cover_letter:
            return "Partially Prepared"
        else:
            return "Not Started"
    
    def mark_as_applied(self):
        """Mark this packet as used for application"""
        from django.utils import timezone
        self.applied = True
        self.applied_at = timezone.now()
        self.save()
    
    def save(self, *args, **kwargs):
        # Auto-set packet_ready based on document availability
        self.packet_ready = self.documents_ready
        super().save(*args, **kwargs)


class UserPreferences(models.Model):
    """
    Extended user preferences for intelligent job matching
    """
    user_profile = models.OneToOneField(
        JobSeekerProfile,
        on_delete=models.CASCADE,
        related_name='preferences',
        help_text="Associated user profile"
    )
    
    # Job Preferences
    preferred_roles = models.JSONField(
        default=list,
        help_text="List of preferred job titles/roles"
    )
    preferred_locations = models.JSONField(
        default=list,
        help_text="List of preferred work locations"
    )
    remote_preference = models.CharField(
        max_length=20,
        choices=[
            ('REMOTE', 'Remote Only'),
            ('HYBRID', 'Hybrid Preferred'),
            ('ONSITE', 'On-site Preferred'),
            ('FLEXIBLE', 'No Preference'),
        ],
        default='FLEXIBLE',
        help_text="Work location preference"
    )
    
    # Compensation
    salary_expectation = models.IntegerField(
        null=True,
        blank=True,
        help_text="Expected annual salary in USD"
    )
    salary_currency = models.CharField(
        max_length=3,
        default='USD',
        help_text="Currency for salary expectation"
    )
    
    # Job Type Preferences
    employment_types = models.JSONField(
        default=list,
        help_text="Preferred employment types (Full-time, Part-time, Contract, etc.)"
    )
    
    # Company Preferences
    company_sizes = models.JSONField(
        default=list,
        help_text="Preferred company sizes (Startup, Mid-size, Enterprise)"
    )
    industries = models.JSONField(
        default=list,
        help_text="Preferred industries"
    )
    
    # AI Matching Preferences
    min_match_score = models.FloatField(
        default=50.0,
        help_text="Minimum job score to consider for applications"
    )
    auto_apply_threshold = models.FloatField(
        default=85.0,
        help_text="Score threshold for automatic application (if enabled)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "User Preferences"
        verbose_name_plural = "User Preferences"
    
    def __str__(self):
        return f"Preferences for {self.user_profile.user.get_full_name()}"
