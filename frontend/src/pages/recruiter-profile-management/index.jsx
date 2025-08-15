import { apiRequest, getApiUrl } from 'utils/api';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import MainLayout from 'components/layout/MainLayout';
import PersonalInfoTab from 'pages/profile-management/components/PersonalInfoTab';
import ProfessionalDetailsTab from 'pages/profile-management/components/ProfessionalDetailsTab';
import PreferencesTab from 'pages/profile-management/components/PreferencesTab';
import SecurityTab from 'pages/profile-management/components/SecurityTab';
import ProfileCompletionMeter from 'pages/profile-management/components/ProfileCompletionMeter';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RecruiterProfileManagement = () => {
    const navigate = useNavigate();
    // Auth check and role-aware redirects
    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (!isAuthenticated) {
            navigate('/authentication-login-register');
            return;
        }

        // Keep recruiters on this page; redirect others to their pages
        if (user.role === 'jobseeker' || user.role === 'job_seeker') {
            navigate('/profile-management');
            return;
        }
        if (user.role === 'employer') {
            navigate('/employer-profile-management');
            return;
        }
        if (user.role === 'administrator') {
            navigate('/admin-profile-management');
            return;
        }
    }, [navigate]);

    const [activeTab, setActiveTab] = useState('personal');
    const [userProfile, setUserProfile] = useState(null);
    const [draftProfile, setDraftProfile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        // Fetch user profile and onboarding data from backend
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const data = await fetch(getApiUrl('/auth/profile/'), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }).then(res => {
                    if (!res.ok) throw new Error('Unauthorized');
                    return res.json();
                });

                // Normalize response into camelCase fields the UI expects
                const profile = data.profile || data.onboarding || {};
                const roleRaw = data.role;
                const tokenForFiles = localStorage.getItem('accessToken') || '';
                const withToken = (url) => (url ? `${url}${url.includes('?') ? '&' : '?'}token=${tokenForFiles}` : '');
                const normalized = {
                    // keep raw
                    ...data,
                    profile, // preserve original for reference
                    role_raw: roleRaw,
                    // camelCase duplicates for UI components
                    id: data.id,
                    username: data.username,
                    email: data.email || profile.email || '',
                    first_name: data.first_name,
                    last_name: data.last_name,
                    // UI reads these camelCase keys
                    firstName: profile.first_name || data.first_name || '',
                    lastName: profile.last_name || data.last_name || '',
                    phone: profile.phone || '',
                    location: profile.location || '',
                    bio: profile.bio || '',
                    // social/links
                    website: profile.website_url || profile.website || '',
                    linkedin: profile.linkedin_url || '',
                    // avatar/logo previews
                    avatar: withToken(profile.profile_image_url || profile.logo_url || ''),
                    profile_image_url: withToken(profile.profile_image_url || ''),
                    resume: withToken(profile.resume_url || ''),
                    resume_url: withToken(profile.resume_url || ''),
                    // professional
                    jobTitle: profile.job_title || '',
                    company: profile.company_name || '',
                    experience: profile.experience_level || '',
                    skills: profile.skills || [],
                    // desired roles from DB-backed profile
                    desiredRoles: Array.isArray(profile.desired_roles)
                        ? profile.desired_roles
                        : (Array.isArray(profile.preferred_roles) ? profile.preferred_roles : []),
                    // For recruiters: allow single primary industry; preserve industries[] too
                    industry: profile.primary_industry || profile.industry || (Array.isArray(profile.industries) && profile.industries[0]) || '',
                    industries: Array.isArray(profile.industries) ? profile.industries : (profile.industry ? [profile.industry] : []),
                    salary: profile.salary || '',
                    salary_min: profile.salary_min || null,
                    salary_max: profile.salary_max || null,
                    salary_currency: profile.salary_currency || 'INR',
                    availability: profile.availability_date || profile.availability_start_date || '',
                    certifications: profile.certifications || [],
                    experiences: Array.isArray(profile.experiences) ? profile.experiences : [],
                    education: Array.isArray(profile.education) ? profile.education : [],
                    onboarding_complete: data.onboarding_complete,
                    // normalize role for UI checks
                    role: roleRaw === 'job_seeker' ? 'jobseeker' : roleRaw
                };

                setUserProfile(normalized);
                setDraftProfile(normalized);
                // Set isAuthenticated to true if profile fetch is successful
                localStorage.setItem('isAuthenticated', 'true');

                // Update localStorage user data with normalized profile
                localStorage.setItem('user', JSON.stringify(normalized));
            } catch (err) {
                // If unauthorized, redirect to login
                localStorage.setItem('isAuthenticated', 'false');
                navigate('/authentication-login-register');
            }
        };
        fetchProfile();
    }, [navigate]);

    useEffect(() => {
        // Auto-save placeholder: keeps lastSaved fresh for UI feedback
        const auto = setInterval(() => {
            if (lastSaved && Date.now() - lastSaved > 30000) {
                console.log('Auto-save due...');
            }
        }, 30000);
        return () => clearInterval(auto);
    }, [lastSaved]);

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: 'User', component: PersonalInfoTab },
        { id: 'professional', label: 'Professional Details', icon: 'Briefcase', component: ProfessionalDetailsTab },
        { id: 'preferences', label: 'Preferences', icon: 'Settings', component: PreferencesTab },
        { id: 'security', label: 'Security', icon: 'Shield', component: SecurityTab }
    ];

    const handleTabChange = (tabId) => setActiveTab(tabId);

    const handleDraftChange = (partial) => {
        setDraftProfile((prev) => ({ ...(prev || userProfile || {}), ...partial }));
    };

    const handleUpdateProfile = async (updatedData) => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');

            // Map camelCase fields from tabs to backend snake_case profile schema
            const roleRaw = userProfile?.role_raw || (userProfile?.role === 'jobseeker' ? 'job_seeker' : userProfile?.role);
            const isJobSeeker = roleRaw === 'job_seeker';
            const isRecruiter = roleRaw === 'recruiter';

            const payload = {
                // Personal
                ...(updatedData.firstName !== undefined && { first_name: updatedData.firstName }),
                ...(updatedData.lastName !== undefined && { last_name: updatedData.lastName }),
                ...(updatedData.email !== undefined && { email: updatedData.email }),
                ...(updatedData.phone !== undefined && { phone: updatedData.phone }),
                ...(updatedData.location !== undefined && { location: updatedData.location }),
                ...(updatedData.bio !== undefined && { bio: updatedData.bio }),
                // Links
                ...(updatedData.website !== undefined && { website_url: updatedData.website }),
                ...(updatedData.linkedin !== undefined && { linkedin_url: updatedData.linkedin }),
                // Professional
                ...(updatedData.jobTitle !== undefined && { job_title: updatedData.jobTitle }),
                ...(updatedData.desiredRoles !== undefined && { preferred_roles: Array.isArray(updatedData.desiredRoles) ? updatedData.desiredRoles : [] }),
                ...(updatedData.skills !== undefined && { skills: Array.isArray(updatedData.skills) ? updatedData.skills : [] }),
                ...(updatedData.certifications !== undefined && { certifications: Array.isArray(updatedData.certifications) ? updatedData.certifications : [] }),
                ...(updatedData.industries !== undefined && { industries: Array.isArray(updatedData.industries) ? updatedData.industries : [] }),
                // New: Resume-like sections
                ...(updatedData.experiences !== undefined && { experiences: Array.isArray(updatedData.experiences) ? updatedData.experiences : [] }),
                ...(updatedData.education !== undefined && { education: Array.isArray(updatedData.education) ? updatedData.education : [] }),
                ...(updatedData.salary_min !== undefined && { salary_min: updatedData.salary_min || null }),
                ...(updatedData.salary_max !== undefined && { salary_max: updatedData.salary_max || null }),
                ...(updatedData.salary_currency !== undefined && { salary_currency: updatedData.salary_currency || 'INR' }),
                // Role-specific mappings
                ...(
                    isJobSeeker && updatedData.experience !== undefined
                        ? { experience_level: updatedData.experience }
                        : {}
                ),
                ...(
                    isJobSeeker && updatedData.portfolio !== undefined
                        ? { portfolio_url: updatedData.portfolio }
                        : {}
                ),
                ...(
                    isJobSeeker && updatedData.industry !== undefined && (updatedData.industries === undefined)
                        ? { industries: updatedData.industry ? [updatedData.industry] : [] }
                        : {}
                ),
                ...(
                    isRecruiter && updatedData.industry !== undefined
                        ? { primary_industry: updatedData.industry }
                        : {}
                ),
            };

            const res = await fetch(getApiUrl('/auth/profile/'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ profile: payload }),
            });
            if (!res.ok) {
                // Attempt to parse error body for useful message
                let details = 'Failed to update profile';
                try {
                    const errJson = await res.json();
                    if (typeof errJson === 'object') {
                        const firstKey = Object.keys(errJson)[0];
                        const firstVal = Array.isArray(errJson[firstKey]) ? errJson[firstKey][0] : errJson[firstKey];
                        details = typeof firstVal === 'string' ? `${firstKey}: ${firstVal}` : details;
                    }
                } catch (_) {
                    try {
                        const txt = await res.text();
                        if (txt) details = txt;
                    } catch (_) { }
                }
                throw new Error(details);
            }
            const data = await res.json();

            // Re-normalize response for UI
            const profile = data.profile || data.onboarding || {};
            const tokenForFiles2 = localStorage.getItem('accessToken') || '';
            const withToken2 = (url) => (url ? `${url}${url.includes('?') ? '&' : '?'}token=${tokenForFiles2}` : '');
            const normalized = {
                ...data,
                profile,
                role_raw: data.role,
                id: data.id,
                username: data.username,
                email: data.email || profile.email || '',
                first_name: data.first_name,
                last_name: data.last_name,
                firstName: profile.first_name || data.first_name || '',
                lastName: profile.last_name || data.last_name || '',
                phone: profile.phone || '',
                location: profile.location || '',
                bio: profile.bio || '',
                website: profile.website_url || profile.website || '',
                linkedin: profile.linkedin_url || '',
                avatar: withToken2(profile.profile_image_url || profile.logo_url || ''),
                profile_image_url: withToken2(profile.profile_image_url || ''),
                resume: withToken2(profile.resume_url || ''),
                resume_url: withToken2(profile.resume_url || ''),
                jobTitle: profile.job_title || '',
                company: profile.company_name || '',
                experience: profile.experience_level || '',
                skills: profile.skills || [],
                desiredRoles: Array.isArray(profile.desired_roles)
                    ? profile.desired_roles
                    : (Array.isArray(profile.preferred_roles) ? profile.preferred_roles : []),
                industry: profile.primary_industry || profile.industry || (Array.isArray(profile.industries) && profile.industries[0]) || '',
                industries: Array.isArray(profile.industries) ? profile.industries : (profile.industry ? [profile.industry] : []),
                salary: profile.salary || '',
                salary_min: profile.salary_min || null,
                salary_max: profile.salary_max || null,
                salary_currency: profile.salary_currency || 'INR',
                availability: profile.availability_date || profile.availability_start_date || '',
                certifications: profile.certifications || [],
                experiences: Array.isArray(profile.experiences) ? profile.experiences : [],
                education: Array.isArray(profile.education) ? profile.education : [],
                onboarding_complete: data.onboarding_complete,
                role: data.role === 'job_seeker' ? 'jobseeker' : data.role,
            };

            setUserProfile(normalized);
            setDraftProfile(normalized);
            localStorage.setItem('user', JSON.stringify(normalized));
            setLastSaved(Date.now());
            // Quick success toast
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-20 right-4 bg-success text-success-foreground px-4 py-2 rounded-squircle z-toast elevation-3';
            successMessage.textContent = 'Profile updated successfully!';
            document.body.appendChild(successMessage);
            setTimeout(() => {
                document.body.removeChild(successMessage);
            }, 3000);
        } catch (err) {
            alert(err?.message || 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

    if (!userProfile) {
        return (
            <MainLayout title="Recruiter Profile Management" description="Loading recruiter profile...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <span className="text-lg text-muted-foreground">Loading profile...</span>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout
            title="Recruiter Profile Management"
            description="Manage your personal information, preferences, and security settings"
        >
            {/* Content layout mirrors jobseeker profile, without sidebar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                    <button onClick={() => navigate('/homepage')} className="hover:text-foreground spring-transition">
                        Dashboard
                    </button>
                    <Icon name="ChevronRight" size={16} />
                    <span className="text-foreground">Recruiter Profile</span>
                </nav>

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-heading font-heading-bold text-foreground mb-2">
                            Recruiter Profile Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your personal information, preferences, and security settings
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        {lastSaved && (
                            <span className="text-xs text-muted-foreground">Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const dataStr = JSON.stringify(userProfile, null, 2);
                                const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                                const exportFileDefaultName = `recruiter_profile_${userProfile.firstName}_${userProfile.lastName}_${new Date().toISOString().split('T')[0]}.json`;
                                const linkElement = document.createElement('a');
                                linkElement.setAttribute('href', dataUri);
                                linkElement.setAttribute('download', exportFileDefaultName);
                                linkElement.click();
                            }}
                            iconName="Download"
                            iconPosition="left"
                            iconSize={16}
                        >
                            Export Profile
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                    {/* Profile Completion */}
                    <div className="lg:col-span-2 flex items-start">
                        <div className="w-full max-w-lg">
                            <ProfileCompletionMeter userProfile={draftProfile || userProfile} />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-4">
                        {/* Tabs nav */}
                        <div className="glassmorphic p-1 rounded-squircle mb-6">
                            <nav className="flex space-x-1 overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`flex items-center space-x-2 px-4 py-3 rounded-squircle spring-transition whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-primary text-primary-foreground glow-primary'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                            }`}
                                    >
                                        <Icon name={tab.icon} size={18} />
                                        <span className="font-body font-body-medium tracking-wide">{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="relative">
                            {isSaving && (
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-squircle">
                                    <div className="flex items-center space-x-2 glassmorphic px-4 py-2 rounded-squircle">
                                        <Icon name="Loader" size={16} className="animate-spin text-primary" />
                                        <span className="text-sm font-body font-body-medium text-foreground">Saving changes...</span>
                                    </div>
                                </div>
                            )}

                            {ActiveTabComponent && (
                                <ActiveTabComponent
                                    userProfile={draftProfile || userProfile}
                                    onUpdateProfile={handleUpdateProfile}
                                    onDraftChange={handleDraftChange}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Ambient Particles */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/10 rounded-full particle-float"></div>
                <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-accent/20 rounded-full particle-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-secondary/15 rounded-full particle-float" style={{ animationDelay: '4s' }}></div>
                <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-primary/15 rounded-full particle-float" style={{ animationDelay: '6s' }}></div>
            </div>
        </MainLayout>
    );
};

export default RecruiterProfileManagement;
