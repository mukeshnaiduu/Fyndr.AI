from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('job_seeker', 'Job Seeker'),
        ('recruiter', 'Recruiter'),
        ('employer', 'Employer'),
        ('administrator', 'Administrator'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.username} ({self.role})"


# Job Seeker Profile Model (matches existing database table)
class JobSeekerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='jobseeker_profile')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_complete = models.BooleanField(default=False)
    
    # Personal Information
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    location = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    timezone = models.CharField(max_length=50, blank=True)
    languages = models.JSONField(default=list, blank=True)
    
    # URLs and Social Links
    profile_image_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    
    # File URLs and Filenames
    resume_url = models.URLField(blank=True)
    resume_filename = models.CharField(max_length=255, blank=True)
    cover_letter_url = models.URLField(blank=True)
    cover_letter_filename = models.CharField(max_length=255, blank=True)
    portfolio_pdf_url = models.URLField(blank=True)
    portfolio_pdf_filename = models.CharField(max_length=255, blank=True)
    
    # File Data (binary storage)
    profile_image_data = models.BinaryField(null=True, blank=True)
    profile_image_content_type = models.CharField(max_length=100, blank=True)
    profile_image_filename = models.CharField(max_length=255, blank=True)
    profile_image_size = models.IntegerField(null=True, blank=True)
    
    resume_data = models.BinaryField(null=True, blank=True)
    resume_content_type = models.CharField(max_length=100, blank=True)
    resume_size = models.IntegerField(null=True, blank=True)
    
    cover_letter_data = models.BinaryField(null=True, blank=True)
    cover_letter_content_type = models.CharField(max_length=100, blank=True)
    cover_letter_size = models.IntegerField(null=True, blank=True)
    
    portfolio_pdf_data = models.BinaryField(null=True, blank=True)
    portfolio_pdf_content_type = models.CharField(max_length=100, blank=True)
    portfolio_pdf_size = models.IntegerField(null=True, blank=True)
    
    # Professional Information
    skills = models.JSONField(default=list, blank=True)
    experience_level = models.CharField(max_length=50, blank=True)
    years_of_experience = models.IntegerField(null=True, blank=True)
    education = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    
    # Career Preferences
    job_title = models.CharField(max_length=100, blank=True)
    job_types = models.JSONField(default=list, blank=True)
    work_arrangement = models.CharField(max_length=50, blank=True)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_currency = models.CharField(max_length=10, blank=True, default='USD')
    preferred_locations = models.JSONField(default=list, blank=True)
    industries = models.JSONField(default=list, blank=True)
    company_size_preference = models.CharField(max_length=50, blank=True)
    benefits_preferences = models.JSONField(default=list, blank=True)
    availability_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'fyndr_auth_jobseekerprofile'

    def __str__(self):
        return f"JobSeekerProfile({self.email or self.user.email})"


# Recruiter/Employer Onboarding Model
class RecruiterEmployerOnboarding(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_onboarding')
    company_name = models.CharField(max_length=255)
    industry = models.CharField(max_length=100)
    company_size = models.CharField(max_length=50)
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    logo = models.URLField(blank=True)
    headquarters = models.CharField(max_length=100, blank=True)
    founded_year = models.CharField(max_length=10, blank=True)
    team_members = models.JSONField(default=list, blank=True)
    invite_emails = models.JSONField(default=list, blank=True)
    default_role = models.CharField(max_length=50, blank=True)
    allow_invites = models.BooleanField(default=False)
    require_approval = models.BooleanField(default=True)
    activity_notifications = models.BooleanField(default=True)
    dei_commitment = models.TextField(blank=True)
    diversity_goals = models.JSONField(default=list, blank=True)
    inclusion_policies = models.JSONField(default=list, blank=True)
    compliance_requirements = models.JSONField(default=list, blank=True)
    reporting_frequency = models.CharField(max_length=50, blank=True)
    diversity_metrics = models.BooleanField(default=False)
    anonymous_data = models.BooleanField(default=False)
    bias_alerts = models.BooleanField(default=False)
    selected_integrations = models.JSONField(default=list, blank=True)
    hris_system = models.CharField(max_length=100, blank=True)
    ats_system = models.CharField(max_length=100, blank=True)
    selected_plan = models.CharField(max_length=50, blank=True)
    billing_cycle = models.CharField(max_length=20, blank=True)
    payment_method = models.CharField(max_length=100, blank=True)
    billing_address = models.JSONField(default=dict, blank=True)
    agree_to_terms = models.BooleanField(default=False)
    marketing_emails = models.BooleanField(default=False)
    sla_acknowledged = models.BooleanField(default=False)
    final_confirmation = models.BooleanField(default=False)

    def __str__(self):
        return f"RecruiterEmployerOnboarding({self.company_name})"
