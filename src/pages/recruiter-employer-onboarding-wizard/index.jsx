import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from 'components/layout/MainLayout';
import ProgressIndicator from 'components/ui/ProgressIndicator';
import CompanyProfileStep from './components/CompanyProfileStep';
import TeamSetupStep from './components/TeamSetupStep';
import DEIComplianceStep from './components/DEIComplianceStep';
import IntegrationsStep from './components/IntegrationsStep';
import BillingStep from './components/BillingStep';
import ReviewStep from './components/ReviewStep';
import CompletionStep from './components/CompletionStep';

const RecruiterEmployerOnboardingWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [formData, setFormData] = useState({
    // Company Profile
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    description: '',
    logo: null,
    headquarters: '',
    foundedYear: '',
    
    // Team Setup
    teamMembers: [],
    inviteEmails: [''],
    defaultRole: 'recruiter',
    allowInvites: false,
    requireApproval: true,
    activityNotifications: true,
    
    // DEI & Compliance
    deiCommitment: '',
    diversityGoals: [],
    inclusionPolicies: [],
    complianceRequirements: [],
    reportingFrequency: '',
    diversityMetrics: false,
    anonymousData: false,
    biasAlerts: false,
    
    // Integrations
    selectedIntegrations: [],
    hrisSystem: null,
    atsSystem: null,
    
    // Billing
    selectedPlan: 'professional',
    billingCycle: 'monthly',
    paymentMethod: '',
    billingAddress: {
      company: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    agreeToTerms: false,
    marketingEmails: false,
    
    // Review & Complete
    slaAcknowledged: false,
    finalConfirmation: false
  });

  const steps = [
    { id: 1, label: 'Company Profile', description: 'Basic company information' },
    { id: 2, label: 'Team Setup', description: 'Configure team and roles' },
    { id: 3, label: 'DEI & Compliance', description: 'Diversity and compliance settings' },
    { id: 4, label: 'Integrations', description: 'Connect your tools' },
    { id: 5, label: 'Billing', description: 'Choose your plan' },
    { id: 6, label: 'Review', description: 'Review and complete setup' }
  ];

  // Auto-save functionality
  useEffect(() => {
    const savedData = localStorage.getItem('recruiter-onboarding-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('recruiter-onboarding-data', JSON.stringify(formData));
  }, [formData]);

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

  const handleStepChange = (stepIndex) => {
    setCurrentStep(stepIndex + 1);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    // Clear saved data after completion
    localStorage.removeItem('recruiter-onboarding-data');
  };

  const renderCurrentStep = () => {
    if (isCompleted) {
      return <CompletionStep data={formData} />;
    }

    switch (currentStep) {
      case 1:
        return (
          <CompanyProfileStep
            data={formData}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 2:
        return (
          <TeamSetupStep
            data={formData}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 3:
        return (
          <DEIComplianceStep
            data={formData}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 4:
        return (
          <IntegrationsStep
            data={formData}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 5:
        return (
          <BillingStep
            data={formData}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 6:
        return (
          <ReviewStep
            data={formData}
            onUpdate={handleStepUpdate}
            onComplete={handleComplete}
            onPrev={handlePrev}
            onStepChange={handleStepChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout
      title="Recruiter Employer Onboarding Wizard"
      description="Complete your employer profile setup"
    >
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50">
        {/* Progress Indicator */}
        {!isCompleted && (
          <div className="mb-8">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={steps.length}
              steps={steps}
              showLabels={true}
              showPercentage={true}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="glass-card p-8 rounded-card shadow-glass">
          {renderCurrentStep()}
        </div>

        {/* Help Section */}
        {!isCompleted && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Need help? Our support team is available 24/7
            </p>
            <div className="flex justify-center space-x-4">
              <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                Live Chat
              </button>
              <span className="text-muted-foreground">•</span>
              <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                Email Support
              </button>
              <span className="text-muted-foreground">•</span>
              <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                Documentation
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RecruiterEmployerOnboardingWizard;

