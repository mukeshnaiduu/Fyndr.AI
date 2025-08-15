import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from 'components/layout/MainLayout';
import ProgressIndicator from 'components/ui/ProgressIndicator';
import ErrorBoundary from 'components/ErrorBoundary';
import CompanyProfileStep from './components/CompanyProfileStep';
import DEIComplianceStep from './components/DEIComplianceStep';
import IntegrationsStep from './components/IntegrationsStep';
import BillingStep from './components/BillingStep';
import { getApiUrl } from 'utils/api';
import ReviewStep from './components/ReviewStep';
import CompletionStep from './components/CompletionStep';
import { apiRequest } from 'utils/api';

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
    defaultRole: 'company',
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
    { id: 2, label: 'DEI & Compliance', description: 'Diversity and compliance settings' },
    { id: 3, label: 'Integrations', description: 'Connect your tools' },
    { id: 4, label: 'Billing', description: 'Choose your plan' },
    { id: 5, label: 'Review', description: 'Review and complete setup' }
];

const CompanyOnboardingWizard = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);
    const [formData, setFormData] = useState(defaultFormData);
    const [loading, setLoading] = useState(true);

    // Check if onboarding is already complete at the start
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Fetch user profile to check onboarding status from Supabase database
            fetch(getApiUrl('/auth/profile/'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            })
                .then(res => {
                    if (!res.ok) throw new Error('Unauthorized');
                    return res.json();
                })
                .then(profileData => {
                    // Check if onboarding exists in database and is complete
                    if (profileData.onboarding_complete && profileData.onboarding &&
                        (profileData.role === 'company')) {
                        // Clear any local onboarding data since it's complete in database
                        localStorage.removeItem('company-onboarding-data');
                        localStorage.setItem('companyOnboardingComplete', 'true');
                        // Redirect to company dashboard
                        navigate('/company-dashboard-pipeline-management');
                        return;
                    }
                    // Continue with normal onboarding flow
                    initializeOnboarding();
                })
                .catch(err => {
                    console.error('Error checking onboarding status:', err);
                    // If there's an error checking backend, proceed with local flow
                    initializeOnboarding();
                });
        } else {
            // No token, redirect to login
            navigate('/authentication-login-register');
        }
    }, [navigate]);

    const initializeOnboarding = async () => {
        const token = localStorage.getItem('accessToken');

        // Get current user info for pre-population
        const userString = localStorage.getItem('user');
        let currentUser = null;
        let initialData = {};

        if (userString) {
            try {
                currentUser = JSON.parse(userString);
                // Initialize with user data from registration
                initialData = {
                    // We don't pre-populate company data since it's company-specific
                    // but we can set up the structure
                };
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }

        // Try to fetch existing onboarding data from backend
        let backendData = {};
        if (token) {
            try {
                const response = await apiRequest('/api/auth/company-profile/', 'GET', null, token);
                if (response && Object.keys(response).length > 0) {
                    // Normalize snake_case API response to wizard's camelCase
                    backendData = {
                        companyName: response.company_name || '',
                        industry: response.industry || '',
                        companySize: response.company_size || '',
                        website: response.website || '',
                        description: response.description || '',
                        logo: response.logo_url || null,
                        headquarters: response.headquarters || '',
                        foundedYear: response.founded_year || '',
                        teamMembers: response.team_members || [],
                        inviteEmails: response.invite_emails || [],
                        defaultRole: response.default_role || 'company',
                        allowInvites: !!response.allow_invites,
                        requireApproval: response.require_approval !== undefined ? !!response.require_approval : true,
                        activityNotifications: !!response.activity_notifications,
                        deiCommitment: response.dei_commitment || '',
                        diversityGoals: response.diversity_goals || [],
                        inclusionPolicies: response.inclusion_policies || [],
                        complianceRequirements: response.compliance_requirements || [],
                        reportingFrequency: response.reporting_frequency || '',
                        diversityMetrics: !!response.diversity_metrics,
                        anonymousData: !!response.anonymous_data,
                        biasAlerts: !!response.bias_alerts,
                        selectedIntegrations: response.selected_integrations || [],
                        hrisSystem: response.hris_system || null,
                        atsSystem: response.ats_system || null,
                        selectedPlan: response.selected_plan || 'professional',
                        billingCycle: response.billing_cycle || 'monthly',
                        paymentMethod: response.payment_method || '',
                        billingAddress: response.billing_address || {},
                        agreeToTerms: !!response.agree_to_terms,
                        marketingEmails: !!response.marketing_emails,
                        slaAcknowledged: !!response.sla_acknowledged,
                        finalConfirmation: !!response.final_confirmation,
                    };
                    console.log('Found existing company onboarding data:', backendData);
                }
            } catch (error) {
                console.log('No existing company onboarding data found, starting fresh');
            }
        }

        // Restore from localStorage and merge with initial data and backend data
        const savedData = localStorage.getItem('company-onboarding-data');
        let localData = {};
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (validateFormData(parsed)) {
                    localData = parsed;
                } else {
                    localStorage.removeItem('company-onboarding-data');
                }
            } catch (error) {
                localStorage.removeItem('company-onboarding-data');
            }
        }

        // Merge data: backend takes priority over local, local takes priority over initial
        const mergedData = { ...initialData, ...localData, ...backendData };
        setFormData(prev => ({ ...prev, ...mergedData }));
        setLoading(false);
    };

    // Validate loaded data
    const validateFormData = (data) => {
        // Basic validation: ensure we got an object; team setup no longer required here
        return typeof data === 'object' && data !== null;
    };

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('company-onboarding-data', JSON.stringify(formData));
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

    const handleComplete = async () => {
        try {
            // Save onboarding data to backend API - convert to snake_case for Django
            const token = localStorage.getItem('accessToken');
            const payload = {
                company_name: formData.companyName || '',
                industry: formData.industry || '',
                company_size: formData.companySize || '',
                website: formData.website || '',
                description: formData.description || '',
                logo_url: formData.logo || '',
                headquarters: formData.headquarters || '',
                founded_year: formData.foundedYear || '',
                team_members: formData.teamMembers || [],
                invite_emails: formData.inviteEmails || [],
                default_role: formData.defaultRole || '',
                allow_invites: formData.allowInvites || false,
                require_approval: formData.requireApproval || true,
                activity_notifications: formData.activityNotifications || true,
                dei_commitment: formData.deiCommitment || '',
                diversity_goals: formData.diversityGoals || [],
                inclusion_policies: formData.inclusionPolicies || [],
                compliance_requirements: formData.complianceRequirements || [],
                reporting_frequency: formData.reportingFrequency || '',
                diversity_metrics: formData.diversityMetrics || false,
                anonymous_data: formData.anonymousData || false,
                bias_alerts: formData.biasAlerts || false,
                selected_integrations: formData.selectedIntegrations || [],
                hris_system: formData.hrisSystem || '',
                ats_system: formData.atsSystem || '',
                selected_plan: formData.selectedPlan || '',
                billing_cycle: formData.billingCycle || '',
                payment_method: formData.paymentMethod || '',
                billing_address: formData.billingAddress || {},
                agree_to_terms: formData.agreeToTerms || false,
                marketing_emails: formData.marketingEmails || false,
                sla_acknowledged: formData.slaAcknowledged || false,
                final_confirmation: formData.finalConfirmation || false,
            };

            await apiRequest('/api/auth/company-profile/', 'POST', payload, token);

            // Fetch updated profile and update localStorage
            const profileRes = await fetch(getApiUrl('/auth/profile/'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                // Merge profile data with onboarding data for complete user info
                const mergedProfile = {
                    ...profileData,
                    ...(profileData.onboarding || {}),
                    id: profileData.id,
                    username: profileData.username,
                    email: profileData.email,
                    first_name: profileData.first_name,
                    last_name: profileData.last_name,
                    role: profileData.role,
                    onboarding_complete: profileData.onboarding_complete
                };
                localStorage.setItem('user', JSON.stringify(mergedProfile));
                // Force Navbar to update by dispatching a storage event
                window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: JSON.stringify(mergedProfile) }));
            }

            setIsCompleted(true);
            localStorage.removeItem('company-onboarding-data');
            // Set onboarding complete flag and redirect to company dashboard
            localStorage.setItem('companyOnboardingComplete', 'true');

            setTimeout(() => {
                navigate('/company-dashboard-pipeline-management');
            }, 1000);
        } catch (err) {
            alert('Failed to save onboarding data. Please try again.');
            console.error('Onboarding save error:', err);
        }
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
                    <DEIComplianceStep
                        data={getStepData()}
                        onUpdate={handleStepUpdate}
                        onNext={handleNext}
                        onPrev={handlePrev}
                    />
                );
            case 3:
                return (
                    <IntegrationsStep
                        data={getStepData()}
                        onUpdate={handleStepUpdate}
                        onNext={handleNext}
                        onPrev={handlePrev}
                    />
                );
            case 4:
                return (
                    <BillingStep
                        data={getStepData()}
                        onUpdate={handleStepUpdate}
                        onNext={handleNext}
                        onPrev={handlePrev}
                    />
                );
            case 5:
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
            title="Company Onboarding Wizard"
            description="Complete your employer profile setup"
        >
            <div className="flex flex-col min-h-screen">
                <div className="flex flex-1 items-center justify-center min-h-screen">
                    <main className="w-full max-w-3xl px-4 py-10">
                        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl">
                            {/* Progress Indicator */}
                            {/* Main Content */}
                            <ErrorBoundary>
                                <div className="p-8 rounded-xl shadow-xl w-full bg-white dark:bg-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">
                                    {!isCompleted && (
                                        <div className="mb-8 w-full">
                                            <ProgressIndicator
                                                currentStep={currentStep}
                                                totalSteps={steps.length}
                                                steps={steps}
                                                showLabels={true}
                                                showPercentage={true}
                                            />
                                        </div>
                                    )}
                                    {loading ? (
                                        <div className="text-center py-8">Loading...</div>
                                    ) : (
                                        <>
                                            {renderCurrentStep()}
                                            {/* Help Section - now inside card */}
                                            {!isCompleted && (
                                                <div className="mt-8 text-center w-full">
                                                    <p className="text-sm text-muted-foreground mb-2 dark:text-gray-400">
                                                        Need help? Our support team is available 24/7
                                                    </p>
                                                    <div className="flex justify-center space-x-4">
                                                        <button className="text-sm text-primary hover:text-primary/80 transition-colors dark:text-blue-400 dark:hover:text-blue-300">
                                                            Live Chat
                                                        </button>
                                                        <span className="text-muted-foreground dark:text-gray-500">•</span>
                                                        <button className="text-sm text-primary hover:text-primary/80 transition-colors dark:text-blue-400 dark:hover:text-blue-300">
                                                            Email Support
                                                        </button>
                                                        <span className="text-muted-foreground dark:text-gray-500">•</span>
                                                        <button className="text-sm text-primary hover:text-primary/80 transition-colors dark:text-blue-400 dark:hover:text-blue-300">
                                                            Documentation
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </ErrorBoundary>
                        </div>
                    </main>
                </div>
            </div>
        </MainLayout>
    );
};

export default CompanyOnboardingWizard;

