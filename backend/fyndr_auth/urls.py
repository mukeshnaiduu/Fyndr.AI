from django.urls import path
from .views import (
    RegisterView, LoginView, ProfileView,
    JobSeekerProfileView, RecruiterProfileView, CompanyProfileView,
    JobSeekerOnboardingView, RecruiterEmployerOnboardingView,  # Backward compatibility
    FileUploadView, FileServeView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    
    # File Upload and Serving
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('files/<str:model_type>/<int:profile_id>/<str:file_type>/', FileServeView.as_view(), name='file-serve'),
    
    # New Profile Endpoints
    path('jobseeker-profile/', JobSeekerProfileView.as_view(), name='jobseeker-profile'),
    path('recruiter-profile/', RecruiterProfileView.as_view(), name='recruiter-profile'),
    path('company-profile/', CompanyProfileView.as_view(), name='company-profile'),
    
    # Backward Compatibility Endpoints
    path('jobseeker-onboarding/', JobSeekerOnboardingView.as_view(), name='jobseeker-onboarding'),
    path('recruiter-onboarding/', RecruiterEmployerOnboardingView.as_view(), name='recruiter-onboarding'),
]
