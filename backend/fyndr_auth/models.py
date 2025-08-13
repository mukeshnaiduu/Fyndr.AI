from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils import timezone
from .utils.crypto import encrypt_text, decrypt_text

class User(AbstractUser):
    ROLE_CHOICES = [
        ('job_seeker', 'Job Seeker'),
        ('recruiter', 'Recruiter'),
        ('company', 'Company'),
        ('administrator', 'Administrator'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.username} ({self.role})"


# Base Profile Model
class BaseProfile(models.Model):
    """Abstract base class for all profile types"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_complete = models.BooleanField(default=False)
    
    class Meta:
        abstract = True


# Job Seeker Profile Model
class JobSeekerProfile(BaseProfile):
    """Profile model for job seekers with all their information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='jobseeker_profile')
    
    # Personal Information
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    location = models.CharField(max_length=100, blank=True)
    
    # Profile Image stored in database as binary data
    profile_image_data = models.BinaryField(blank=True, null=True)
    profile_image_filename = models.CharField(max_length=255, blank=True)
    profile_image_content_type = models.CharField(max_length=100, blank=True)
    profile_image_size = models.IntegerField(null=True, blank=True)
    profile_image_url = models.URLField(blank=True)
    
    # Professional Links
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    
    # Resume and Documents (stored as binary data in database)
    resume_data = models.BinaryField(blank=True, null=True)
    resume_filename = models.CharField(max_length=255, blank=True)
    resume_content_type = models.CharField(max_length=100, blank=True)
    resume_size = models.IntegerField(null=True, blank=True)
    resume_url = models.URLField(blank=True)  # For external URLs
    
    cover_letter_data = models.BinaryField(blank=True, null=True)
    cover_letter_filename = models.CharField(max_length=255, blank=True)
    cover_letter_content_type = models.CharField(max_length=100, blank=True)
    cover_letter_size = models.IntegerField(null=True, blank=True)
    cover_letter_url = models.URLField(blank=True)
    
    portfolio_pdf_data = models.BinaryField(blank=True, null=True)
    portfolio_pdf_filename = models.CharField(max_length=255, blank=True)
    portfolio_pdf_content_type = models.CharField(max_length=100, blank=True)
    portfolio_pdf_size = models.IntegerField(null=True, blank=True)
    portfolio_pdf_url = models.URLField(blank=True)
    
    # Skills and Experience
    skills = models.JSONField(default=list, blank=True)
    experience_level = models.CharField(max_length=50, blank=True)
    years_of_experience = models.IntegerField(null=True, blank=True)
    education = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    
    # Career Preferences
    job_title = models.CharField(max_length=100, blank=True)
    job_types = models.JSONField(default=list, blank=True)  # ['full-time', 'part-time', 'contract']
    work_arrangement = models.CharField(max_length=50, blank=True)  # 'remote', 'hybrid', 'onsite'
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_currency = models.CharField(max_length=10, default='USD')
    preferred_locations = models.JSONField(default=list, blank=True)
    industries = models.JSONField(default=list, blank=True)
    company_size_preference = models.CharField(max_length=50, blank=True)
    benefits_preferences = models.JSONField(default=list, blank=True)
    availability_date = models.DateField(null=True, blank=True)
    
    # Additional Information
    bio = models.TextField(blank=True)
    languages = models.JSONField(default=list, blank=True)
    timezone = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return f"JobSeekerProfile({self.first_name} {self.last_name})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


# Recruiter Profile Model
class RecruiterProfile(BaseProfile):
    """Profile model for recruiters with their professional information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    
    # Personal Information
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    location = models.CharField(max_length=100, blank=True)
    
    # Profile Image stored in database as binary data
    profile_image_data = models.BinaryField(blank=True, null=True)
    profile_image_filename = models.CharField(max_length=255, blank=True)
    profile_image_content_type = models.CharField(max_length=100, blank=True)
    profile_image_size = models.IntegerField(null=True, blank=True)
    profile_image_url = models.URLField(blank=True)
    
    # Professional Links
    linkedin_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    
    # Professional Information
    job_title = models.CharField(max_length=100, blank=True)
    years_of_experience = models.IntegerField(null=True, blank=True)
    specializations = models.JSONField(default=list, blank=True)
    industries = models.JSONField(default=list, blank=True)
    
    # Resume and Documents (stored as binary data in database)
    resume_data = models.BinaryField(blank=True, null=True)
    resume_filename = models.CharField(max_length=255, blank=True)
    resume_content_type = models.CharField(max_length=100, blank=True)
    resume_size = models.IntegerField(null=True, blank=True)
    resume_url = models.URLField(blank=True)  # For external URLs
    
    # Company Associations (can be associated with multiple companies)
    company_associations = models.JSONField(default=list, blank=True)  # List of company IDs and roles
    current_company_id = models.IntegerField(null=True, blank=True)  # Currently active company
    
    # Bio and Additional Info
    bio = models.TextField(blank=True)
    timezone = models.CharField(max_length=50, blank=True)
    skills = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return f"RecruiterProfile({self.first_name} {self.last_name})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


# Company Profile Model
class CompanyProfile(BaseProfile):
    """Profile model for companies/employers"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company_profile')
    
    # Company Basic Information
    company_name = models.CharField(max_length=255)
    industry = models.CharField(max_length=100, blank=True)
    company_size = models.CharField(max_length=50, blank=True)
    founded_year = models.IntegerField(null=True, blank=True)
    headquarters = models.CharField(max_length=200, blank=True)
    
    # Company Details
    website = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    mission_statement = models.TextField(blank=True)
    
    # Branding and Media (stored as binary data in database)
    logo_data = models.BinaryField(blank=True, null=True)
    logo_filename = models.CharField(max_length=255, blank=True)
    logo_content_type = models.CharField(max_length=100, blank=True)
    logo_size = models.IntegerField(null=True, blank=True)
    logo_url = models.URLField(blank=True)  # For external URLs
    
    company_brochure_data = models.BinaryField(blank=True, null=True)
    company_brochure_filename = models.CharField(max_length=255, blank=True)
    company_brochure_content_type = models.CharField(max_length=100, blank=True)
    company_brochure_size = models.IntegerField(null=True, blank=True)
    company_brochure_url = models.URLField(blank=True)
    
    # Company Culture and Values
    company_values = models.JSONField(default=list, blank=True)
    company_benefits = models.JSONField(default=list, blank=True)
    work_environment = models.CharField(max_length=50, blank=True)  # 'remote', 'hybrid', 'onsite'
    
    # Diversity, Equity & Inclusion
    dei_commitment = models.TextField(blank=True)
    diversity_goals = models.JSONField(default=list, blank=True)
    inclusion_policies = models.JSONField(default=list, blank=True)
    
    # Contact Information
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)
    hr_contact_name = models.CharField(max_length=100, blank=True)
    hr_contact_email = models.EmailField(blank=True)
    
    # Additional Information
    locations = models.JSONField(default=list, blank=True)
    tech_stack = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return f"CompanyProfile({self.company_name})"


# Company-Recruiter Relationship Model
class CompanyRecruiterRelationship(models.Model):
    """Model for managing relationships between companies and recruiters"""
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='recruiter_relationships')
    recruiter = models.ForeignKey(RecruiterProfile, on_delete=models.CASCADE, related_name='company_relationships')
    
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('recruiter', 'Recruiter'),
        ('hiring_manager', 'Hiring Manager'),
        ('viewer', 'Viewer'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='recruiter')
    
    # Invitation and Status
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('revoked', 'Revoked'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    invited_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    # Access Control
    permissions = models.JSONField(default=dict, blank=True)  # JSON field for custom permissions
    
    class Meta:
        unique_together = ('company', 'recruiter')
        
    def __str__(self):
        return f"Company: {self.company.company_name} - Recruiter: {self.recruiter.full_name} ({self.role})"


class PortalCredentials(models.Model):
    """Encrypted credentials for ATS/company portals per user/company."""
    PROVIDER_CHOICES = [
        ('greenhouse', 'Greenhouse'),
        ('lever', 'Lever'),
        ('workday', 'Workday'),
        ('site', 'Company Site'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='portal_credentials')
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    company_domain = models.CharField(max_length=255, blank=True)
    username_encrypted = models.BinaryField()
    password_encrypted = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'provider', 'company_domain')

    @property
    def username(self) -> str:
        from .utils.crypto import decrypt_text
        try:
            return decrypt_text(self.username_encrypted)
        except Exception:
            return ''

    @property
    def password(self) -> str:
        from .utils.crypto import decrypt_text
        try:
            return decrypt_text(self.password_encrypted)
        except Exception:
            return ''

    @classmethod
    def upsert(cls, user, provider: str, username: str, password: str, company_domain: str = ''):
        from .utils.crypto import encrypt_text
        obj, _ = cls.objects.update_or_create(
            user=user,
            provider=provider,
            company_domain=company_domain,
            defaults={
                'username_encrypted': encrypt_text(username),
                'password_encrypted': encrypt_text(password),
            }
        )
        return obj


class OAuthToken(models.Model):
    """Stores OAuth tokens for providers like Google (Gmail).

    Tokens are stored encrypted at rest. Access tokens are optional; refresh tokens are
    sufficient for future API access. Scopes and expiry are tracked for UX.
    """
    PROVIDER_CHOICES = [
        ('google', 'Google'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='oauth_tokens')
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    sub = models.CharField(max_length=255, blank=True)  # Provider-specific subject/user id
    scope = models.TextField(blank=True)
    access_token_encrypted = models.BinaryField(blank=True, null=True)
    refresh_token_encrypted = models.BinaryField(blank=True, null=True)
    token_type = models.CharField(max_length=50, blank=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'provider')

    @property
    def access_token(self) -> str:
        if not self.access_token_encrypted:
            return ''
        try:
            return decrypt_text(self.access_token_encrypted)
        except Exception:
            return ''

    @access_token.setter
    def access_token(self, value: str):
        self.access_token_encrypted = encrypt_text(value) if value else None

    @property
    def refresh_token(self) -> str:
        if not self.refresh_token_encrypted:
            return ''
        try:
            return decrypt_text(self.refresh_token_encrypted)
        except Exception:
            return ''

    @refresh_token.setter
    def refresh_token(self, value: str):
        self.refresh_token_encrypted = encrypt_text(value) if value else None

    def is_expired(self) -> bool:
        return bool(self.expires_at and timezone.now() >= self.expires_at)
