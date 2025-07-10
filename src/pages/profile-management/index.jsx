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
  const [activeTab, setActiveTab] = useState('personal');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState({
    id: 1,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: `Passionate software engineer with 5+ years of experience in full-stack development. I love creating innovative solutions and working with cutting-edge technologies. Always eager to learn and contribute to meaningful projects that make a difference.`,
    website: 'https://sarahjohnson.dev',
    linkedin: 'https://linkedin.com/in/sarahjohnson',
    twitter: 'https://twitter.com/sarahdev',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9e2b8c4?w=150&h=150&fit=crop&crop=face',
    role: 'jobseeker',
    jobTitle: 'Senior Software Engineer',
    company: 'TechCorp Inc.',
    experience: 'senior',
    industry: 'technology',
    salary: '$90,000 - $120,000',
    availability: '2weeks',
    skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL', 'TypeScript', 'MongoDB'],
    certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
    portfolio: 'https://sarahjohnson.dev/portfolio',
    resume: null,
    twoFactorEnabled: false,
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'America/Los_Angeles',
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
        jobAlerts: true,
        interviewReminders: true,
        applicationUpdates: true,
        weeklyDigest: true
      },
      privacy: {
        profileVisibility: 'recruiters',
        showEmail: false,
        showPhone: false,
        allowMessages: true,
        showOnlineStatus: true,
        dataCollection: true
      },
      jobPreferences: {
        remoteWork: true,
        relocation: false,
        travelRequired: false,
        partTime: false,
        contract: true,
        freelance: false
      }
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    // Check authentication status
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);

    if (!authStatus) {
      navigate('/authentication-login-register');
      return;
    }

    // Auto-save functionality
    const autoSaveInterval = setInterval(() => {
      if (lastSaved && Date.now() - lastSaved > 30000) { // 30 seconds
        handleAutoSave();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [navigate, lastSaved]);

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
    
    // Simulate API call
    setTimeout(() => {
      setUserProfile(prev => ({
        ...prev,
        ...updatedData
      }));
      setIsSaving(false);
      setLastSaved(Date.now());
      
      // Show success feedback
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-20 right-4 bg-success text-success-foreground px-4 py-2 rounded-squircle z-toast elevation-3';
      successMessage.textContent = 'Profile updated successfully!';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    }, 1500);
  };

  const handleAutoSave = () => {
    // Auto-save logic here
    console.log('Auto-saving profile...');
  };

  const handleExportProfile = () => {
    const dataStr = JSON.stringify(userProfile, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `profile_${userProfile.firstName}_${userProfile.lastName}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <MainLayout
      title="Profile Management"
      description="Manage your personal information, preferences, and security settings"
    >
      <SidebarLayout 
        sidebar={
          <div className="p-6 h-full">
            {/* Sidebar content can be implemented here if needed */}
            <ProfileCompletionMeter progress={70} />
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">PROFILE SECTIONS</h3>
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm ${
                      activeTab === tab.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent/50 text-foreground'
                    }`}
                  >
                    <Icon name={tab.icon} size={18} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        sidebarWidth={260}
        collapsible
      >
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Completion Sidebar */}
            <div className="lg:col-span-1">
              <ProfileCompletionMeter userProfile={userProfile} />
              
              {/* Quick Actions */}
              <div className="glassmorphic p-4 rounded-squircle mt-6">
                <h3 className="font-heading font-heading-semibold text-foreground mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => navigate('/video-interview-interface')}
                    iconName="Video"
                    iconPosition="left"
                    iconSize={16}
                    className="justify-start"
                  >
                    Practice Interview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => navigate('/notifications-center')}
                    iconName="Bell"
                    iconPosition="left"
                    iconSize={16}
                    className="justify-start"
                  >
                    View Notifications
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => navigate('/about-contact-page')}
                    iconName="HelpCircle"
                    iconPosition="left"
                    iconSize={16}
                    className="justify-start"
                  >
                    Get Help
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Tab Navigation */}
              <div className="glassmorphic p-1 rounded-squircle mb-6">
                <nav className="flex space-x-1 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-squircle spring-transition whitespace-nowrap ${
                        activeTab === tab.id
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
      </SidebarLayout>
    </MainLayout>
  );
};

export default ProfileManagement;
