from django.urls import path
from .views import (
    RegisterView, LoginView, ProfileView,
    JobSeekerProfileView, RecruiterProfileView, CompanyProfileView,
    JobSeekerOnboardingView, RecruiterOnboardingView, CompanyOnboardingView,  # Backward compatibility
    FileUploadView, FileServeView, ResumeParseView,
    GoogleAuthInitView, GoogleAuthCallbackView, GoogleDisconnectView, GoogleAuthStatusView
)
from .views import LocationsListView, SkillsListView, JobRolesListView, IndustriesListView, SalaryBandsListView, RecruitersListView, RecruiterDetailView, CompaniesListView, CompanyDetailView

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    # Google OAuth
    path('oauth/google/init/', GoogleAuthInitView.as_view(), name='google-oauth-init'),
    path('oauth/google/callback/', GoogleAuthCallbackView.as_view(), name='google-oauth-callback'),
    path('oauth/google/disconnect/', GoogleDisconnectView.as_view(), name='google-oauth-disconnect'),
    path('oauth/google/status/', GoogleAuthStatusView.as_view(), name='google-oauth-status'),
    
    # File Upload and Serving
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('resume/parse/', ResumeParseView.as_view(), name='resume-parse'),
    path('files/<str:model_type>/<int:profile_id>/<str:file_type>/', FileServeView.as_view(), name='file-serve'),
    path('locations/', LocationsListView.as_view(), name='locations-list'),
    path('skills/', SkillsListView.as_view(), name='skills-list'),
    path('roles/', JobRolesListView.as_view(), name='roles-list'),
    path('industries/', IndustriesListView.as_view(), name='industries-list'),
    path('salary-bands/', SalaryBandsListView.as_view(), name='salary-bands-list'),
    path('recruiters/', RecruitersListView.as_view(), name='recruiters-list'),
    path('recruiters/<int:recruiter_id>/', RecruiterDetailView.as_view(), name='recruiter-detail'),
    path('companies/', CompaniesListView.as_view(), name='companies-list'),
    path('companies/<int:company_id>/', CompanyDetailView.as_view(), name='company-detail'),
    
    # Profile Endpoints
    path('jobseeker-profile/', JobSeekerProfileView.as_view(), name='jobseeker-profile'),
    path('recruiter-profile/', RecruiterProfileView.as_view(), name='recruiter-profile'),
    path('company-profile/', CompanyProfileView.as_view(), name='company-profile'),
    
    # Team management endpoints moved to team_management app under /api/team/
    
    # Backward Compatibility Endpoints
    path('jobseeker-onboarding/', JobSeekerOnboardingView.as_view(), name='jobseeker-onboarding'),
    path('recruiter-onboarding/', RecruiterOnboardingView.as_view(), name='recruiter-onboarding'),
    path('company-onboarding/', CompanyOnboardingView.as_view(), name='company-onboarding'),
]
