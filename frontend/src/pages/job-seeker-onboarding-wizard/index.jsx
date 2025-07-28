import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import WizardLayout from './components/WizardLayout';
import WizardProgress from './components/WizardProgress';
import PersonalInfoStep from './components/PersonalInfoStep';
import ResumeUploadStep from './components/ResumeUploadStep';
import SkillAssessmentStep from './components/SkillAssessmentStep';
import CareerPreferencesStep from './components/CareerPreferencesStep';
import ProfileReviewStep from './components/ProfileReviewStep';
import { apiRequest } from 'utils/api';

const JobSeekerOnboardingWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Personal Info',
      description: 'Basic information about you',
      icon: 'User',
      component: PersonalInfoStep
    },
    {
      id: 2,
      title: 'Resume Upload',
      description: 'Upload your resume for AI analysis',
      icon: 'FileText',
      component: ResumeUploadStep
    },
    {
      id: 3,
      title: 'Skills Assessment',
      description: 'Add your technical and professional skills',
      icon: 'Zap',
      component: SkillAssessmentStep
    },
    {
      id: 4,
      title: 'Career Preferences',
      description: 'Tell us what you are looking for',
      icon: 'Target',
      component: CareerPreferencesStep
    },
    {
      id: 5,
      title: 'Review Profile',
      description: 'Review and complete your setup',
      icon: 'CheckCircle',
      component: ProfileReviewStep
    }
  ];

  // Load saved progress from localStorage, but only if it matches the current user
  useEffect(() => {
    // Check if onboarding is already complete by checking the backend
    const token = localStorage.getItem('accessToken');
    const isAuthenticatedFlag = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!token || !isAuthenticatedFlag || token.trim() === '') {
      console.error('JobSeekerOnboardingWizard - no valid authentication token');
      // No token, redirect to login
      navigate('/authentication-login-register');
      return;
    }
    
    console.log('JobSeekerOnboardingWizard - checking onboarding status...');
    
    // Fetch user profile to check onboarding status from Supabase database
    fetch('/api/auth/profile/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          console.error('JobSeekerOnboardingWizard - profile fetch failed:', res.status, res.statusText);
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(profileData => {
        console.log('JobSeekerOnboardingWizard - profile data received:', profileData);
        
        // Check if onboarding exists in database and is complete
        if (profileData.onboarding_complete && profileData.onboarding) {
          console.log('JobSeekerOnboardingWizard - onboarding already complete, redirecting...');
          // Clear any local onboarding data since it's complete in database
          localStorage.removeItem('jobSeekerOnboardingData');
          localStorage.removeItem('jobSeekerOnboardingStep');
          localStorage.removeItem('jobSeekerOnboardingUserId');
          localStorage.setItem('jobSeekerOnboardingComplete', 'true');
          // Redirect to jobs page
          navigate('/job-search-application-hub');
          return;
        }
        // Continue with normal onboarding flow
        console.log('JobSeekerOnboardingWizard - proceeding with onboarding flow');
        loadSavedProgress();
      })
      .catch(err => {
        console.error('JobSeekerOnboardingWizard - error checking onboarding status:', err);
        // If there's an error checking backend, check if it's an auth issue
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          // Token is invalid, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('isAuthenticated');
          navigate('/authentication-login-register');
        } else {
          // Other error, proceed with local flow
          loadSavedProgress();
        }
      });
  }, [navigate]);

  const loadSavedProgress = () => {
    // Get current user info and token
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    let currentUserId = null;
    if (userString) {
      try {
        const user = JSON.parse(userString);
        currentUserId = user?.id || user?.email || null;
      } catch (e) {
        currentUserId = null;
      }
    }

    const savedData = localStorage.getItem('jobSeekerOnboardingData');
    const savedStep = localStorage.getItem('jobSeekerOnboardingStep');
    const savedUserId = localStorage.getItem('jobSeekerOnboardingUserId');

    // If no user, no token, or user changed, clear onboarding progress and start fresh
    if (!currentUserId || !token || savedUserId !== currentUserId) {
      localStorage.removeItem('jobSeekerOnboardingData');
      localStorage.removeItem('jobSeekerOnboardingStep');
      localStorage.setItem('jobSeekerOnboardingUserId', currentUserId || '');
      setFormData({});
      setCurrentStep(1);
      return;
    }

    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }

    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }
  };

  // Save progress to localStorage, including user id/email
  useEffect(() => {
    // Get current user info (e.g., from localStorage or your auth context)
    const userString = localStorage.getItem('user');
    let currentUserId = null;
    if (userString) {
      try {
        const user = JSON.parse(userString);
        currentUserId = user?.id || user?.email || null;
      } catch (e) {
        currentUserId = null;
      }
    }
    localStorage.setItem('jobSeekerOnboardingData', JSON.stringify(formData));
    localStorage.setItem('jobSeekerOnboardingStep', currentStep.toString());
    localStorage.setItem('jobSeekerOnboardingUserId', currentUserId || '');
  }, [formData, currentStep]);

  const handleStepUpdate = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveAndExit = () => {
    // Data is already saved in localStorage via useEffect
    alert('Progress saved! You can continue later from where you left off.');
    window.location.href = '/ai-powered-job-feed-dashboard';
  };

  const handleComplete = async () => {
    setIsLoading(true);
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    let currentUserId = null;
    if (userString) {
      try {
        const user = JSON.parse(userString);
        currentUserId = user?.id || user?.email || null;
      } catch (e) {
        currentUserId = null;
      }
    }
    if (!currentUserId || !token) {
      alert('You must be logged in to complete onboarding. Please log in again.');
      localStorage.removeItem('jobSeekerOnboardingData');
      localStorage.removeItem('jobSeekerOnboardingStep');
      localStorage.removeItem('jobSeekerOnboardingUserId');
      setFormData({});
      setCurrentStep(1);
      setIsLoading(false);
      return;
    }
    try {
      // Save onboarding data to backend API (Supabase via Django ORM)
      // Ensure payload matches backend model fields
      const payload = {
        ...formData,
        // flatten nested objects if needed, e.g. career_preferences
        ...(formData.career_preferences || {}),
        // Remove nested career_preferences to avoid duplication
      };
      delete payload.career_preferences;
      const profile = await apiRequest(
        '/api/auth/jobseeker-onboarding/',
        'POST',
        payload,
        token
      );
      // Optionally update user in localStorage with onboarding complete/profile info
      if (profile && profile.id) {
        localStorage.setItem('user', JSON.stringify(profile));
      }
      // Clear saved progress
      localStorage.removeItem('jobSeekerOnboardingData');
      localStorage.removeItem('jobSeekerOnboardingStep');
      localStorage.removeItem('jobSeekerOnboardingUserId');
      // Set onboarding complete flag and redirect to job feed dashboard
      localStorage.setItem('jobSeekerOnboardingComplete', 'true');
      window.location.href = '/ai-powered-job-feed-dashboard';
    } catch (err) {
      alert('Failed to save onboarding data. Please try again.');
      console.error('Onboarding save error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  if (!CurrentStepComponent) {
    return (
      <WizardLayout>
        <div className="text-center py-12">
          <p className="text-error">Invalid step. Please refresh the page.</p>
        </div>
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      onSaveAndExit={handleSaveAndExit}
      showSaveOption={currentStep < steps.length}
    >
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <WizardProgress
          currentStep={currentStep}
          totalSteps={steps.length}
          steps={steps}
        />

        {/* Step Content */}
        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">
            <CurrentStepComponent
              key={currentStep}
              data={formData}
              onUpdate={handleStepUpdate}
              onNext={handleNext}
              onPrev={handlePrev}
              onComplete={handleComplete}
              isLoading={isLoading}
            />
          </AnimatePresence>
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Auto-Save Enabled</span>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@fyndrai.com" className="text-primary hover:underline">
                support@fyndrai.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
};

export default JobSeekerOnboardingWizard;
