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


# Job Seeker Onboarding Model
class JobSeekerOnboarding(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='jobseeker_onboarding')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    location = models.CharField(max_length=100, blank=True)
    profile_image = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    resume = models.JSONField(default=dict, blank=True)  # stores resume file info (name, url, etc)
    skills = models.JSONField(default=list, blank=True)
    career_preferences = models.JSONField(default=dict, blank=True)
    # Career Preferences fields
    job_title = models.CharField(max_length=100, blank=True)
    job_types = models.JSONField(default=list, blank=True)
    work_arrangement = models.CharField(max_length=50, blank=True)
    salary_min = models.CharField(max_length=20, blank=True)
    salary_max = models.CharField(max_length=20, blank=True)
    preferred_locations = models.JSONField(default=list, blank=True)
    industries = models.JSONField(default=list, blank=True)
    company_size = models.CharField(max_length=50, blank=True)
    benefits = models.JSONField(default=list, blank=True)
    availability_date = models.CharField(max_length=30, blank=True)
    # Add more fields as needed for other steps

    def __str__(self):
        return f"JobSeekerOnboarding({self.email})"


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
