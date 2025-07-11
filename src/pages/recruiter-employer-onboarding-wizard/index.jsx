import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from 'components/layout/MainLayout';
import ProgressIndicator from 'components/ui/ProgressIndicator';
import ErrorBoundary from 'components/ErrorBoundary';
import CompanyProfileStep from './components/CompanyProfileStep';
import TeamSetupStep from './components/TeamSetupStep';
import DEIComplianceStep from './components/DEIComplianceStep';
import IntegrationsStep from './components/IntegrationsStep';
import BillingStep from './components/BillingStep';
import ReviewStep from './components/ReviewStep';
import CompletionStep from './components/CompletionStep';

const defaultFormData = {
  companyName: '',
  industry: '',
  companySize: '',
  website: '',
  description: '',
  logo: null,
  headquarters: '',
  foundedYear: '',
  teamMembers: [],
  inviteEmails: [''],
  defaultRole: 'recruiter',
  allowInvites: false,
  requireApproval: true,
  activityNotifications: true,
  deiCommitment: '',
  diversityGoals: [],
  inclusionPolicies: [],
  complianceRequirements: [],
  reportingFrequency: '',
  diversityMetrics: false,
  anonymousData: false,
  biasAlerts: false,
  selectedIntegrations: [],
  hrisSystem: null,
  atsSystem: null,
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
  slaAcknowledged: false,
  finalConfirmation: false
};

const steps = [
  { id: 1, label: 'Company Profile', description: 'Basic company information' },
  { id: 2, label: 'Team Setup', description: 'Configure team and roles' },
  { id: 3, label: 'DEI & Compliance', description: 'Diversity and compliance settings' },
  { id: 4, label: 'Integrations', description: 'Connect your tools' },
  { id: 5, label: 'Billing', description: 'Choose your plan' },
  { id: 6, label: 'Review', description: 'Review and complete setup' }
];

const RecruiterEmployerOnboardingWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(true);

  // Validate loaded data
  const validateFormData = (data) => {
    // Basic validation: check for required keys
    return typeof data === 'object' && data !== null && 'companyName' in data && 'teamMembers' in data;
  };

  useEffect(() => {
    // Restore from localStorage
    const savedData = localStorage.getItem('recruiter-onboarding-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (validateFormData(parsed)) {
          setFormData(prev => ({ ...prev, ...parsed }));
        } else {
          localStorage.removeItem('recruiter-onboarding-data');
        }
      } catch (error) {
        localStorage.removeItem('recruiter-onboarding-data');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('recruiter-onboarding-data', JSON.stringify(formData));
    }
  }, [formData, loading]);

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
    localStorage.removeItem('recruiter-onboarding-data');
  };

  // Ensure all required fields are present for each step
  const getStepData = () => {
    // Defensive copy with fallback for missing fields
    return {
      ...defaultFormData,
      ...formData
    };
  };

  const renderCurrentStep = () => {
    if (isCompleted) {
      return <CompletionStep data={getStepData()} />;
    }
    switch (currentStep) {
      case 1:
        return (
          <CompanyProfileStep
            data={getStepData()}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 2:
        return (
          <TeamSetupStep
            data={getStepData()}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 3:
        return (
          <DEIComplianceStep
            data={getStepData()}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 4:
        return (
          <IntegrationsStep
            data={getStepData()}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 5:
        return (
          <BillingStep
            data={getStepData()}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 6:
        return (
          <ReviewStep
            data={getStepData()}
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
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1">
          <main className="flex-1 ml-0 md:ml-16 lg:ml-64 pt-16">
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
              <ErrorBoundary>
                <div className="glass-card p-8 rounded-card shadow-glass">
                  {loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : (
                    renderCurrentStep()
                  )}
                </div>
              </ErrorBoundary>
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
          </main>
        </div>
      </div>
    </MainLayout>
  );
};

export default RecruiterEmployerOnboardingWizard;

