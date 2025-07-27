
import { apiRequest, getApiUrl } from 'utils/api';
import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import MainLayout from 'components/layout/MainLayout';
import SidebarLayout from 'components/layout/SidebarLayout';
import PersonalInfoTab from './components/PersonalInfoTab';
import ProfessionalDetailsTab from './components/ProfessionalDetailsTab';
import PreferencesTab from './components/PreferencesTab';
import SecurityTab from './components/SecurityTab';
import ProfileCompletionMeter from './components/ProfileCompletionMeter';


const ProfileManagement = () => {
  const navigate = useNavigate();
  // Top-level isAuthenticated check and role-based redirect
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!isAuthenticated) {
      navigate('/authentication-login-register');
      return;
    }

    // Redirect to role-specific profile pages
    if (user.role === 'recruiter') {
      navigate('/recruiter-profile-management');
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
    // Job seekers stay on this page
  }, [navigate]);

  const [activeTab, setActiveTab] = useState('personal');
  const [userProfile, setUserProfile] = useState(null);
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

        // Merge user data with onboarding data for display
        const mergedProfile = {
          ...data,
          // If onboarding data exists, merge it into the main profile
          ...(data.onboarding || {}),
          // Keep original user fields with priority
          id: data.id,
          username: data.username,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
          onboarding_complete: data.onboarding_complete
        };

        setUserProfile(mergedProfile);
        // Set isAuthenticated to true if profile fetch is successful
        localStorage.setItem('isAuthenticated', 'true');

        // Update localStorage user data with merged profile
        localStorage.setItem('user', JSON.stringify(mergedProfile));
      } catch (err) {
        // If unauthorized, redirect to login
        localStorage.setItem('isAuthenticated', 'false');
        navigate('/authentication-login-register');
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    // Auto-save functionality
    const autoSaveInterval = setInterval(() => {
      if (lastSaved && Date.now() - lastSaved > 30000) { // 30 seconds
        handleAutoSave();
      }
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [lastSaved]);

  const tabs = [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: 'User',
      component: PersonalInfoTab
    },
    {
      id: 'professional',
      label: 'Professional Details',
      icon: 'Briefcase',
      component: ProfessionalDetailsTab
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: 'Settings',
      component: PreferencesTab
    },
    {
      id: 'security',
      label: 'Security',
      icon: 'Shield',
      component: SecurityTab
    }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleUpdateProfile = async (updatedData) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(getApiUrl('/auth/profile/'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const data = await res.json();
      setUserProfile(data);
      setLastSaved(Date.now());
      // Show success feedback
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-20 right-4 bg-success text-success-foreground px-4 py-2 rounded-squircle z-toast elevation-3';
      successMessage.textContent = 'Profile updated successfully!';
      document.body.appendChild(successMessage);
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoSave = () => {
    // Auto-save logic here
    console.log('Auto-saving profile...');
  };

  const handleExportProfile = () => {
    const dataStr = JSON.stringify(userProfile, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `profile_${userProfile.firstName}_${userProfile.lastName}_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  if (!userProfile) {
    return (
      <MainLayout title="Profile Management" description="Loading user profile...">
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="text-lg text-muted-foreground">Loading profile...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Profile Management"
      description="Manage your personal information, preferences, and security settings"
    >
      {/* Removed SidebarLayout and sidebar, main content only */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <button
            onClick={() => navigate('/homepage')}
            className="hover:text-foreground spring-transition"
          >
            Dashboard
          </button>
          <Icon name="ChevronRight" size={16} />
          <span className="text-foreground">Profile Management</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-heading-bold text-foreground mb-2">
              Profile Management
            </h1>
            <p className="text-muted-foreground">
              Manage your personal information, preferences, and security settings
            </p>
          </div>

          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                Last saved: {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportProfile}
              iconName="Download"
              iconPosition="left"
              iconSize={16}
            >
              Export Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Profile Completion - left only, slightly wider */}
          <div className="lg:col-span-2 flex items-start">
            <div className="w-full max-w-lg">
              <ProfileCompletionMeter userProfile={userProfile} />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {/* Tab Navigation */}
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
                    <span className="font-body font-body-medium tracking-wide">
                      {tab.label}
                    </span>
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
                    <span className="text-sm font-body font-body-medium text-foreground">
                      Saving changes...
                    </span>
                  </div>
                </div>
              )}

              {ActiveTabComponent && (
                <ActiveTabComponent
                  userProfile={userProfile}
                  onUpdateProfile={handleUpdateProfile}
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
}
// ...existing code...

export default ProfileManagement;
