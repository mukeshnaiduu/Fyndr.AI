from django.db import models
from django.conf import settings
from django.utils import timezone
import hashlib


class JobPosting(models.Model):
    """
    Comprehensive model to store job postings with extensive metadata.
    
    Each job posting is uniquely identified by external_id + source combination
    to prevent duplicates from the same source.
    """
    
    # 📂 Core Metadata
    external_id = models.CharField(
        max_length=255,
        help_text="Unique identifier from the source (can be URL hash if no ID available)"
    )
    title = models.CharField(max_length=255, help_text="Job title")
    company = models.CharField(max_length=255, help_text="Company name")
    company_logo = models.URLField(
        blank=True, 
        null=True, 
        help_text="URL to company logo image"
    )
    location = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        help_text="Job location (can be 'Remote', city, etc.)"
    )
    url = models.URLField(help_text="Direct link to the job posting")
    # New unified model fields
    SOURCE_TYPE_CHOICES = [
        ('scraped', 'Scraped'),
        ('recruiter', 'Recruiter'),
    ]
    source_type = models.CharField(
        max_length=20,
        choices=SOURCE_TYPE_CHOICES,
        default='scraped',
        help_text="Origin of this job (scraped vs posted by recruiter)"
    )
    APPLICATION_MODE_CHOICES = [
        ('redirect', 'Redirect'),
        ('quick', 'Quick Apply'),
    ]
    application_mode = models.CharField(
        max_length=20,
        choices=APPLICATION_MODE_CHOICES,
        default='redirect',
        help_text="Primary apply experience for this job"
    )
    apply_url = models.URLField(
        blank=True,
        null=True,
        help_text="Explicit application URL if different from job detail URL"
    )
    recruiter_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='recruiter_jobs',
        blank=True,
        null=True,
        help_text="Recruiter user who owns this posting (for recruiter source)"
    )
    source = models.CharField(
        max_length=50,
        help_text="Source identifier (e.g., 'greenhouse', 'weworkremotely')"
    )
    date_posted = models.DateField(
        null=True, 
        blank=True,
        help_text="Date the job was originally posted (from source)"
    )
    date_scraped = models.DateTimeField(
        default=timezone.now,
        help_text="When this job was scraped by our system"
    )
    
    # Job Classification
    JOB_TYPE_CHOICES = [
        ('full-time', 'Full-time'),
        ('part-time', 'Part-time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('freelance', 'Freelance'),
        ('temporary', 'Temporary'),
        ('volunteer', 'Volunteer'),
    ]
    job_type = models.CharField(
        max_length=20,
        choices=JOB_TYPE_CHOICES,
        blank=True,
        null=True,
        help_text="Employment type"
    )
    
    EMPLOYMENT_MODE_CHOICES = [
        ('on-site', 'On-site'),
        ('remote', 'Remote'),
        ('hybrid', 'Hybrid'),
    ]
    employment_mode = models.CharField(
        max_length=20,
        choices=EMPLOYMENT_MODE_CHOICES,
        blank=True,
        null=True,
        help_text="Work arrangement"
    )
    
    # 📑 Job Content
    description = models.TextField(help_text="Full job description", blank=True, null=True)
    responsibilities = models.TextField(
        blank=True, 
        null=True,
        help_text="Specific duties and expectations"
    )
    requirements = models.TextField(
        blank=True, 
        null=True,
        help_text="Required qualifications and skills"
    )
    skills_required = models.JSONField(
        default=list,
        blank=True,
        help_text="List of required hard and soft skills"
    )
    skills_preferred = models.JSONField(
        default=list,
        blank=True,
        help_text="List of preferred/nice-to-have skills"
    )
    
    EXPERIENCE_LEVEL_CHOICES = [
        ('entry', 'Entry Level'),
        ('junior', 'Junior'),
        ('mid', 'Mid Level'),
        ('senior', 'Senior'),
        ('lead', 'Lead'),
        ('principal', 'Principal'),
        ('executive', 'Executive'),
        ('director', 'Director'),
    ]
    experience_level = models.CharField(
        max_length=20,
        choices=EXPERIENCE_LEVEL_CHOICES,
        blank=True,
        null=True,
        help_text="Required experience level"
    )
    
    EDUCATION_LEVEL_CHOICES = [
        ('high-school', 'High School'),
        ('associate', "Associate's Degree"),
        ('bachelor', "Bachelor's Degree"),
        ('master', "Master's Degree"),
        ('phd', 'PhD'),
        ('professional', 'Professional Degree'),
        ('none', 'No Degree Required'),
    ]
    education_level = models.CharField(
        max_length=20,
        choices=EDUCATION_LEVEL_CHOICES,
        blank=True,
        null=True,
        help_text="Required education level"
    )
    
    certifications = models.JSONField(
        default=list,
        blank=True,
        help_text="Required or preferred certifications"
    )
    tools_technologies = models.JSONField(
        default=list,
        blank=True,
        help_text="Specific software, frameworks, or platforms"
    )
    
    # 💼 Compensation & Benefits
    salary_min = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Minimum salary"
    )
    salary_max = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Maximum salary"
    )
    currency = models.CharField(
        max_length=3,
        default='USD',
        help_text="Currency code (USD, EUR, INR, etc.)"
    )
    
    COMPENSATION_TYPE_CHOICES = [
        ('hourly', 'Hourly'),
        ('annual', 'Annual'),
        ('monthly', 'Monthly'),
        ('weekly', 'Weekly'),
        ('daily', 'Daily'),
        ('commission', 'Commission-based'),
        ('contract', 'Contract Rate'),
    ]
    compensation_type = models.CharField(
        max_length=20,
        choices=COMPENSATION_TYPE_CHOICES,
        default='annual',
        help_text="Type of compensation"
    )
    
    benefits = models.JSONField(
        default=list,
        blank=True,
        help_text="List of benefits offered"
    )
    bonus_equity = models.TextField(
        blank=True,
        null=True,
        help_text="Stock options, performance bonuses, equity details"
    )
    
    # 🏢 Company Insights
    COMPANY_SIZE_CHOICES = [
        ('startup', 'Startup (1-50)'),
        ('small', 'Small (51-200)'),
        ('medium', 'Medium (201-1000)'),
        ('large', 'Large (1001-5000)'),
        ('enterprise', 'Enterprise (5000+)'),
    ]
    company_size = models.CharField(
        max_length=20,
        choices=COMPANY_SIZE_CHOICES,
        blank=True,
        null=True,
        help_text="Company size category"
    )
    
    industry = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Industry/sector (e.g., Tech, Finance, Healthcare)"
    )
    company_rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        help_text="Company rating (e.g., from Glassdoor)"
    )
    company_website = models.URLField(
        blank=True,
        null=True,
        help_text="Company homepage URL"
    )
    
    # 📊 Recruitment & Posting Details
    application_deadline = models.DateField(
        null=True,
        blank=True,
        help_text="Application deadline"
    )
    
    APPLICATION_METHOD_CHOICES = [
        ('direct', 'Direct Apply'),
        ('email', 'Email Application'),
        ('third-party', 'Third-party Portal'),
        ('company-website', 'Company Website'),
        ('recruiter', 'Contact Recruiter'),
    ]
    application_method = models.CharField(
        max_length=20,
        choices=APPLICATION_METHOD_CHOICES,
        default='direct',
        help_text="How to apply for this job"
    )
    
    hiring_manager = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Hiring manager or recruiter contact"
    )
    number_of_openings = models.PositiveIntegerField(
        default=1,
        help_text="Number of positions available"
    )
    
    # 🌐 Contextual Data
    visa_sponsorship = models.BooleanField(
        default=False,
        help_text="Whether visa sponsorship is available"
    )
    relocation_assistance = models.BooleanField(
        default=False,
        help_text="Whether relocation assistance is provided"
    )
    travel_requirements = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Travel percentage or requirements"
    )
    languages_required = models.JSONField(
        default=list,
        blank=True,
        help_text="Required languages"
    )
    
    # 🔍 ML/Parsing Enrichments
    job_category = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Derived job category (e.g., Software Engineering → Backend)"
    )
    seniority_score = models.IntegerField(
        default=0,
        help_text="Parsed seniority level (0-10 scale)"
    )
    keywords = models.JSONField(
        default=list,
        blank=True,
        help_text="Extracted keywords for searchability"
    )
    projects_portfolio_examples = models.TextField(
        blank=True,
        null=True,
        help_text="Required project examples or portfolio requirements"
    )
    
    # System metadata
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this job posting is still active"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Additional parsing metadata
    parse_confidence = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.0,
        help_text="Confidence score of the parsing (0-100)"
    )
    raw_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Raw scraped data for debugging"
    )
    
    class Meta:
        # Ensure no duplicate jobs from the same source
        unique_together = ['external_id', 'source']
        ordering = ['-date_scraped', '-date_posted']
        indexes = [
            models.Index(fields=['source', 'date_scraped']),
            models.Index(fields=['company']),
            models.Index(fields=['location']),
            models.Index(fields=['is_active']),
            models.Index(fields=['job_type']),
            models.Index(fields=['employment_mode']),
            models.Index(fields=['experience_level']),
            models.Index(fields=['industry']),
            models.Index(fields=['salary_min', 'salary_max']),
            models.Index(fields=['date_posted']),
            models.Index(fields=['source_type', 'recruiter_owner', 'is_active', 'date_posted']),
        ]
    
    def __str__(self):
        return f"{self.title} at {self.company} ({self.source})"
    
    @property
    def salary_range_display(self):
        """Display salary range in a human-readable format"""
        if self.salary_min and self.salary_max:
            return f"{self.currency} {self.salary_min:,.0f} - {self.salary_max:,.0f}"
        elif self.salary_min:
            return f"{self.currency} {self.salary_min:,.0f}+"
        elif self.salary_max:
            return f"Up to {self.currency} {self.salary_max:,.0f}"
        return "Salary not specified"
    
    @classmethod
    def generate_external_id(cls, url, title=None, company=None):
        """
        Generate a unique external_id when source doesn't provide one.
        Uses URL and optionally title/company for uniqueness.
        """
        base_string = url
        if title:
            base_string += f"|{title}"
        if company:
            base_string += f"|{company}"
        
        return hashlib.md5(base_string.encode()).hexdigest()[:16]
    
    def save(self, *args, **kwargs):
        """Override save to auto-generate external_id if not provided."""
        if not self.external_id:
            self.external_id = self.generate_external_id(
                self.url, self.title, self.company
            )
        super().save(*args, **kwargs)
