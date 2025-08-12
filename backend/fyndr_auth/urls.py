from django.urls import path
from .views import (
    RegisterView, LoginView, ProfileView,
    JobSeekerProfileView, RecruiterProfileView, CompanyProfileView,
    JobSeekerOnboardingView, RecruiterOnboardingView, CompanyOnboardingView,  # Backward compatibility
    CompanyRecruiterInvitationView, CompanyRecruiterResponseView, RecruiterCompanySelectionView,
    FileUploadView, FileServeView,
    GoogleAuthInitView, GoogleAuthCallbackView, GoogleDisconnectView, GoogleAuthStatusView
)

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
    path('files/<str:model_type>/<int:profile_id>/<str:file_type>/', FileServeView.as_view(), name='file-serve'),
    
    # Profile Endpoints
    path('jobseeker-profile/', JobSeekerProfileView.as_view(), name='jobseeker-profile'),
    path('recruiter-profile/', RecruiterProfileView.as_view(), name='recruiter-profile'),
    path('company-profile/', CompanyProfileView.as_view(), name='company-profile'),
    
    # Company-Recruiter Relationship Endpoints
    path('company/invitations/', CompanyRecruiterInvitationView.as_view(), name='company-invitations'),
    path('recruiter/invitations/<int:invitation_id>/respond/', CompanyRecruiterResponseView.as_view(), name='respond-invitation'),
    path('recruiter/select-company/', RecruiterCompanySelectionView.as_view(), name='select-company'),
    
    # Backward Compatibility Endpoints
    path('jobseeker-onboarding/', JobSeekerOnboardingView.as_view(), name='jobseeker-onboarding'),
    path('recruiter-onboarding/', RecruiterOnboardingView.as_view(), name='recruiter-onboarding'),
    path('company-onboarding/', CompanyOnboardingView.as_view(), name='company-onboarding'),
]
