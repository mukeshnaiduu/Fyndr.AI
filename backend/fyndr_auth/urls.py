from django.urls import path
from .views import RegisterView, LoginView, JobSeekerOnboardingView, RecruiterEmployerOnboardingView, ProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('jobseeker-onboarding/', JobSeekerOnboardingView.as_view(), name='jobseeker-onboarding'),
    path('recruiter-onboarding/', RecruiterEmployerOnboardingView.as_view(), name='recruiter-onboarding'),
    path('profile/', ProfileView.as_view(), name='profile'),
]
