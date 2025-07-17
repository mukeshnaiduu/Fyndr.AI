import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

import Select from 'components/ui/Select';

const PreferencesTab = ({ userProfile, onUpdateProfile }) => {
  const [preferences, setPreferences] = useState({
    theme: userProfile.preferences?.theme || 'system',
    language: userProfile.preferences?.language || 'en',
    timezone: userProfile.preferences?.timezone || 'UTC',
    notifications: {
      email: userProfile.preferences?.notifications?.email ?? true,
      push: userProfile.preferences?.notifications?.push ?? true,
      sms: userProfile.preferences?.notifications?.sms ?? false,
      marketing: userProfile.preferences?.notifications?.marketing ?? false,
      jobAlerts: userProfile.preferences?.notifications?.jobAlerts ?? true,
      interviewReminders: userProfile.preferences?.notifications?.interviewReminders ?? true,
      applicationUpdates: userProfile.preferences?.notifications?.applicationUpdates ?? true,
      weeklyDigest: userProfile.preferences?.notifications?.weeklyDigest ?? false
    },
    privacy: {
      profileVisibility: userProfile.preferences?.privacy?.profileVisibility || 'public',
      showEmail: userProfile.preferences?.privacy?.showEmail ?? false,
      showPhone: userProfile.preferences?.privacy?.showPhone ?? false,
      allowMessages: userProfile.preferences?.privacy?.allowMessages ?? true,
      showOnlineStatus: userProfile.preferences?.privacy?.showOnlineStatus ?? true,
      dataCollection: userProfile.preferences?.privacy?.dataCollection ?? true
    },
    jobPreferences: {
      remoteWork: userProfile.preferences?.jobPreferences?.remoteWork ?? true,
      relocation: userProfile.preferences?.jobPreferences?.relocation ?? false,
      travelRequired: userProfile.preferences?.jobPreferences?.travelRequired ?? false,
      partTime: userProfile.preferences?.jobPreferences?.partTime ?? false,
      contract: userProfile.preferences?.jobPreferences?.contract ?? false,
      freelance: userProfile.preferences?.jobPreferences?.freelance ?? false
    }
  });

  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    // Detect system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => {
      if (preferences.theme === 'system') {
        setCurrentTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setCurrentTheme(preferences.theme);
      }
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [preferences.theme]);

  const themeOptions = [
    { value: 'light', label: 'Light Theme' },
    { value: 'dark', label: 'Dark Theme' },
    { value: 'system', label: 'System Default' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' }
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];

  const privacyOptions = [
    { value: 'public', label: 'Public - Visible to everyone' },
    { value: 'recruiters', label: 'Recruiters Only - Visible to verified recruiters' },
    { value: 'private', label: 'Private - Only visible to you' }
  ];

  const handleThemeChange = (theme) => {
    setPreferences(prev => ({
      ...prev,
      theme
    }));
  };

  const handleNotificationChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handleJobPreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        [key]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile({ preferences });
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label className="text-sm font-body font-body-medium text-foreground">
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full spring-transition ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white spring-transition ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Appearance Settings */}
        <div className="glassmorphic p-6 rounded-squircle">
          <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
            <Icon name="Palette" size={20} className="mr-2" />
            Appearance
          </h3>
          
          <div className="space-y-4">
            <Select
              label="Theme"
              options={themeOptions}
              value={preferences.theme}
              onChange={handleThemeChange}
              description="Choose your preferred theme or use system default"
            />

            <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-squircle">
              <div className="flex items-center space-x-2">
                <Icon name="Sun" size={16} className="text-warning" />
                <span className="text-sm">Light</span>
              </div>
              <div className="flex-1 h-2 bg-gradient-to-r from-warning via-primary to-secondary rounded-full"></div>
              <div className="flex items-center space-x-2">
                <Icon name="Moon" size={16} className="text-primary" />
                <span className="text-sm">Dark</span>
              </div>
            </div>

            <Select
              label="Language"
              options={languageOptions}
              value={preferences.language}
              onChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
              description="Select your preferred language"
            />

            <Select
              label="Timezone"
              options={timezoneOptions}
              value={preferences.timezone}
              onChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}
              description="Your local timezone for scheduling"
            />
          </div>
        </div>

        {/* Notification Settings */}
        <div className="glassmorphic p-6 rounded-squircle">
          <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
            <Icon name="Bell" size={20} className="mr-2" />
            Notifications
          </h3>
          
          <div className="space-y-1 divide-y divide-border/50">
            <ToggleSwitch
              checked={preferences.notifications.email}
              onChange={(value) => handleNotificationChange('email', value)}
              label="Email Notifications"
              description="Receive notifications via email"
            />

            <ToggleSwitch
              checked={preferences.notifications.push}
              onChange={(value) => handleNotificationChange('push', value)}
              label="Push Notifications"
              description="Receive browser push notifications"
            />

            <ToggleSwitch
              checked={preferences.notifications.sms}
              onChange={(value) => handleNotificationChange('sms', value)}
              label="SMS Notifications"
              description="Receive important updates via SMS"
            />

            <ToggleSwitch
              checked={preferences.notifications.jobAlerts}
              onChange={(value) => handleNotificationChange('jobAlerts', value)}
              label="Job Alerts"
              description="Get notified about new job opportunities"
            />

            <ToggleSwitch
              checked={preferences.notifications.interviewReminders}
              onChange={(value) => handleNotificationChange('interviewReminders', value)}
              label="Interview Reminders"
              description="Reminders for upcoming interviews"
            />

            <ToggleSwitch
              checked={preferences.notifications.applicationUpdates}
              onChange={(value) => handleNotificationChange('applicationUpdates', value)}
              label="Application Updates"
              description="Updates on your job applications"
            />

            <ToggleSwitch
              checked={preferences.notifications.weeklyDigest}
              onChange={(value) => handleNotificationChange('weeklyDigest', value)}
              label="Weekly Digest"
              description="Weekly summary of your activity"
            />

            <ToggleSwitch
              checked={preferences.notifications.marketing}
              onChange={(value) => handleNotificationChange('marketing', value)}
              label="Marketing Communications"
              description="Promotional emails and product updates"
            />
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="glassmorphic p-6 rounded-squircle">
          <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
            <Icon name="Shield" size={20} className="mr-2" />
            Privacy & Security
          </h3>
          
          <div className="space-y-4">
            <Select
              label="Profile Visibility"
              options={privacyOptions}
              value={preferences.privacy.profileVisibility}
              onChange={(value) => handlePrivacyChange('profileVisibility', value)}
              description="Control who can see your profile"
            />

            <div className="space-y-1 divide-y divide-border/50">
              <ToggleSwitch
                checked={preferences.privacy.showEmail}
                onChange={(value) => handlePrivacyChange('showEmail', value)}
                label="Show Email Address"
                description="Display your email on your public profile"
              />

              <ToggleSwitch
                checked={preferences.privacy.showPhone}
                onChange={(value) => handlePrivacyChange('showPhone', value)}
                label="Show Phone Number"
                description="Display your phone number on your public profile"
              />

              <ToggleSwitch
                checked={preferences.privacy.allowMessages}
                onChange={(value) => handlePrivacyChange('allowMessages', value)}
                label="Allow Direct Messages"
                description="Let recruiters and employers message you directly"
              />

              <ToggleSwitch
                checked={preferences.privacy.showOnlineStatus}
                onChange={(value) => handlePrivacyChange('showOnlineStatus', value)}
                label="Show Online Status"
                description="Display when you're online or last active"
              />

              <ToggleSwitch
                checked={preferences.privacy.dataCollection}
                onChange={(value) => handlePrivacyChange('dataCollection', value)}
                label="Analytics & Data Collection"
                description="Help improve our service by sharing usage data"
              />
            </div>
          </div>
        </div>

        {/* Job Preferences (Job Seekers only) */}
        {userProfile.role === 'jobseeker' && (
          <div className="glassmorphic p-6 rounded-squircle">
            <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
              <Icon name="Briefcase" size={20} className="mr-2" />
              Job Preferences
            </h3>
            
            <div className="space-y-1 divide-y divide-border/50">
              <ToggleSwitch
                checked={preferences.jobPreferences.remoteWork}
                onChange={(value) => handleJobPreferenceChange('remoteWork', value)}
                label="Remote Work"
                description="Open to remote work opportunities"
              />

              <ToggleSwitch
                checked={preferences.jobPreferences.relocation}
                onChange={(value) => handleJobPreferenceChange('relocation', value)}
                label="Willing to Relocate"
                description="Open to relocating for the right opportunity"
              />

              <ToggleSwitch
                checked={preferences.jobPreferences.travelRequired}
                onChange={(value) => handleJobPreferenceChange('travelRequired', value)}
                label="Travel Required"
                description="Open to positions requiring travel"
              />

              <ToggleSwitch
                checked={preferences.jobPreferences.partTime}
                onChange={(value) => handleJobPreferenceChange('partTime', value)}
                label="Part-time Positions"
                description="Interested in part-time opportunities"
              />

              <ToggleSwitch
                checked={preferences.jobPreferences.contract}
                onChange={(value) => handleJobPreferenceChange('contract', value)}
                label="Contract Work"
                description="Open to contract positions"
              />

              <ToggleSwitch
                checked={preferences.jobPreferences.freelance}
                onChange={(value) => handleJobPreferenceChange('freelance', value)}
                label="Freelance Work"
                description="Available for freelance projects"
              />
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="default"
            iconName="Save"
            iconPosition="left"
            iconSize={16}
            className="glow-primary"
          >
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PreferencesTab;
