import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import WizardLayout from './components/WizardLayout';
import WizardProgress from './components/WizardProgress';
import PersonalInfoStep from './components/PersonalInfoStep';
import ResumeUploadStep from './components/ResumeUploadStep';
import SkillAssessmentStep from './components/SkillAssessmentStep';
import CareerPreferencesStep from './components/CareerPreferencesStep';
import ProfileReviewStep from './components/ProfileReviewStep';

const JobSeekerOnboardingWizard = () => {
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

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('jobSeekerOnboardingData');
    const savedStep = localStorage.getItem('jobSeekerOnboardingStep');
    
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
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('jobSeekerOnboardingData', JSON.stringify(formData));
    localStorage.setItem('jobSeekerOnboardingStep', currentStep.toString());
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

  const handleComplete = () => {
    // Clear saved progress
    localStorage.removeItem('jobSeekerOnboardingData');
    localStorage.removeItem('jobSeekerOnboardingStep');
    
    // Navigate to dashboard (handled in ProfileReviewStep)
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
              <a href="mailto:support@hirehubai.com" className="text-primary hover:underline">
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
