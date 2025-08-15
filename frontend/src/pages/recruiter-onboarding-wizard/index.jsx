import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import WizardLayout from './components/WizardLayout';
import WizardProgress from './components/WizardProgress';
import PersonalInfoStep from './components/PersonalInfoStep';
import ResumeUploadStep from './components/ResumeUploadStep';
import RecruiterPreferencesStep from './components/RecruiterPreferencesStep';
import ProfileReviewStep from './components/ProfileReviewStep';
import { getApiUrl } from 'utils/api';
import { apiRequest } from 'utils/api';

const RecruiterOnboardingWizard = () => {
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
            title: 'Recruiter Preferences',
            description: 'Tell us about your recruiting focus',
            icon: 'Target',
            component: RecruiterPreferencesStep
        },
        {
            id: 4,
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
                    if (profileData.onboarding_complete && profileData.onboarding) {
                        // Clear any local onboarding data since it's complete in database
                        localStorage.removeItem('recruiterOnboardingData');
                        localStorage.removeItem('recruiterOnboardingStep');
                        localStorage.removeItem('recruiterOnboardingUserId');
                        localStorage.setItem('recruiterOnboardingComplete', 'true');
                        // Redirect to recruiter dashboard
                        navigate('/recruiter-dashboard-pipeline-management');
                        return;
                    }
                    // Continue with normal onboarding flow
                    loadSavedProgress();
                })
                .catch(err => {
                    console.error('Error checking onboarding status:', err);
                    // If there's an error checking backend, proceed with local flow
                    loadSavedProgress();
                });
        } else {
            // No token, redirect to login
            navigate('/authentication-login-register');
        }
    }, [navigate]);

    const loadSavedProgress = async () => {
        // Get current user info and token
        const userString = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
        let currentUserId = null;
        let currentUser = null;

        if (userString) {
            try {
                currentUser = JSON.parse(userString);
                currentUserId = currentUser?.id || currentUser?.email || null;
            } catch (e) {
                currentUserId = null;
            }
        }

        const savedData = localStorage.getItem('recruiterOnboardingData');
        const savedStep = localStorage.getItem('recruiterOnboardingStep');
        const savedUserId = localStorage.getItem('recruiterOnboardingUserId');

        // Initialize form data with user info from backend
        let backendData = {};
        if (token) {
            try {
                const response = await apiRequest('/api/auth/recruiter-profile/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response && Object.keys(response).length > 0) {
                    backendData = {
                        firstName: response.first_name || '',
                        lastName: response.last_name || '',
                        email: response.email || '',
                        ...response // Include any other existing onboarding data
                    };
                    console.log('Loaded user data from backend:', backendData);
                }
            } catch (error) {
                console.log('No existing onboarding data found, using user data from registration');
                // Fallback to localStorage user data if backend call fails
                if (currentUser) {
                    backendData = {
                        firstName: currentUser.first_name || '',
                        lastName: currentUser.last_name || '',
                        email: currentUser.email || ''
                    };
                }
            }
        }

        // If no user, no token, or user changed, clear onboarding progress and start fresh
        if (!currentUserId || !token || savedUserId !== currentUserId) {
            localStorage.removeItem('recruiterOnboardingData');
            localStorage.removeItem('recruiterOnboardingStep');
            localStorage.setItem('recruiterOnboardingUserId', currentUserId || '');
            setFormData(backendData);
            setCurrentStep(1);
            return;
        }

        // Merge saved local data with backend data (local data takes precedence for draft changes)
        let finalData = { ...backendData };
        if (savedData) {
            try {
                const parsedSavedData = JSON.parse(savedData);
                finalData = { ...backendData, ...parsedSavedData };
            } catch (error) {
                console.error('Error loading saved data:', error);
                finalData = backendData;
            }
        }

        setFormData(finalData);

        if (savedStep) {
            const parsed = parseInt(savedStep);
            const clamped = Math.max(1, Math.min(parsed, steps.length));
            setCurrentStep(clamped);
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
        localStorage.setItem('recruiterOnboardingData', JSON.stringify(formData));
        localStorage.setItem('recruiterOnboardingStep', currentStep.toString());
        localStorage.setItem('recruiterOnboardingUserId', currentUserId || '');
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
        window.location.href = '/recruiter-dashboard-pipeline-management';
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
            localStorage.removeItem('recruiterOnboardingData');
            localStorage.removeItem('recruiterOnboardingStep');
            localStorage.removeItem('recruiterOnboardingUserId');
            setFormData({});
            setCurrentStep(1);
            setIsLoading(false);
            return;
        }
        try {
            // Save onboarding data to backend API
            // Map camelCase form keys to backend snake_case fields
            const remoteWork = Array.isArray(formData.workArrangements) && formData.workArrangements.includes('remote');
            // Clamp salaries to backend constraint (<= 8 digits before decimal)
            const MAX_SALARY_ALLOWED = 9999999999;
            const sMinRaw = formData.salaryMin === '' ? null : Number(formData.salaryMin);
            const sMaxRaw = formData.salaryMax === '' ? null : Number(formData.salaryMax);
            if (sMinRaw !== null && (Number.isNaN(sMinRaw) || sMinRaw < 0 || sMinRaw >= MAX_SALARY_ALLOWED)) {
                throw new Error('Minimum salary must be a number less than 100,000,000');
            }
            if (sMaxRaw !== null && (Number.isNaN(sMaxRaw) || sMaxRaw < 0 || sMaxRaw >= MAX_SALARY_ALLOWED)) {
                throw new Error('Maximum salary must be a number less than 100,000,000');
            }
            if (sMinRaw !== null && sMaxRaw !== null && sMaxRaw <= sMinRaw) {
                throw new Error('Maximum salary must be greater than minimum salary');
            }
            // Send salary as strings for DecimalField compatibility
            const salaryFrom = sMinRaw !== null ? String(sMinRaw) : null;
            const salaryTo = sMaxRaw !== null ? String(sMaxRaw) : null;
            const skillsFromATSTools = Array.isArray(formData.atsTools) ? formData.atsTools : undefined;
            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                location: formData.location,
                // If we've uploaded an image, send its raw URL; backend will move it to profile_image_url
                profile_image: (formData.profileImageFile && formData.profileImageFile.url) || formData.profileImage || undefined,
                linkedin_url: formData.linkedinUrl || undefined,
                job_title: formData.jobTitle,
                industries: Array.isArray(formData.industries) ? formData.industries : undefined,
                // Preferences mapping
                recruitment_type: formData.recruiterType || undefined,
                remote_work: !!remoteWork,
                // position_types omitted
                salary_currency: (salaryFrom || salaryTo) ? 'INR' : undefined,
                salary_range_from: salaryFrom,
                salary_range_to: salaryTo,
                recruiting_areas: Array.isArray(formData.focusRoles) ? formData.focusRoles : undefined,
                bio: formData.notes || undefined,
                // Attach ATS/Tools to skills so backend can normalize
                skills: skillsFromATSTools,
                communication_preferences: {
                    ...(formData.companySize ? { company_size: formData.companySize } : {}),
                    ...(formData.hiringVolume ? { hiring_volume: formData.hiringVolume } : {}),
                },
            };
            // Remove undefined keys
            Object.keys(payload).forEach(k => {
                if (payload[k] === undefined || payload[k] === '') delete payload[k];
            });
            const profile = await apiRequest(
                '/api/auth/recruiter-profile/',
                'POST',
                payload,
                token
            );
            // Ensure role and onboarding flags are set before redirect
            if (profile && profile.id) {
                const existing = JSON.parse(localStorage.getItem('user') || '{}');
                const merged = { ...existing, ...profile };
                if (!merged.role) merged.role = 'recruiter';
                localStorage.setItem('user', JSON.stringify(merged));
                localStorage.setItem('userRole', merged.role);
            } else {
                // Fallback: set role explicitly
                localStorage.setItem('userRole', 'recruiter');
            }
            localStorage.setItem('recruiterOnboardingComplete', 'true');
            // Clear saved progress
            localStorage.removeItem('recruiterOnboardingData');
            localStorage.removeItem('recruiterOnboardingStep');
            localStorage.removeItem('recruiterOnboardingUserId');
            // Set onboarding complete flag and redirect to recruiter dashboard
            window.location.href = '/recruiter-dashboard-pipeline-management';
        } catch (err) {
            alert(`Failed to save onboarding data: ${err.message || 'Please try again.'}`);
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

export default RecruiterOnboardingWizard;
