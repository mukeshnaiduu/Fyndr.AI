import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import { Checkbox } from 'components/ui/Checkbox';

const GlobalConfigSection = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'HireHub AI',
    platformDescription: 'AI-powered hiring and learning platform',
    supportEmail: 'support@hirehub.ai',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxFileUploadSize: '10',
    sessionTimeout: '30'
  });

  const [featureFlags, setFeatureFlags] = useState({
    aiCoachEnabled: true,
    courseRecommendations: true,
    jobMatching: true,
    forumEnabled: true,
    videoCallsEnabled: false,
    darkModeEnabled: true,
    notificationsEnabled: true,
    analyticsEnabled: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: '8',
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    maxLoginAttempts: '5',
    lockoutDuration: '15',
    twoFactorRequired: false,
    sessionSecurityLevel: 'medium'
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.hirehub.ai',
    smtpPort: '587',
    smtpUsername: 'noreply@hirehub.ai',
    smtpPassword: '••••••••',
    fromEmail: 'noreply@hirehub.ai',
    fromName: 'HireHub AI',
    emailTemplatesEnabled: true
  });

  const tabs = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'features', label: 'Features', icon: 'Zap' },
    { id: 'security', label: 'Security', icon: 'Shield' },
    { id: 'email', label: 'Email', icon: 'Mail' },
    { id: 'api', label: 'API', icon: 'Code' },
    { id: 'backup', label: 'Backup', icon: 'Database' }
  ];

  const securityLevelOptions = [
    { value: 'low', label: 'Low - Basic security' },
    { value: 'medium', label: 'Medium - Standard security' },
    { value: 'high', label: 'High - Enhanced security' }
  ];

  const handleSettingChange = (section, key, value) => {
    setHasUnsavedChanges(true);
    
    if (section === 'general') {
      setGeneralSettings(prev => ({ ...prev, [key]: value }));
    } else if (section === 'features') {
      setFeatureFlags(prev => ({ ...prev, [key]: value }));
    } else if (section === 'security') {
      setSecuritySettings(prev => ({ ...prev, [key]: value }));
    } else if (section === 'email') {
      setEmailSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleSaveSettings = () => {
    console.log('Saving settings...');
    setHasUnsavedChanges(false);
  };

  const handleResetSettings = () => {
    console.log('Resetting settings...');
    setHasUnsavedChanges(false);
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Input
          label="Platform Name"
          value={generalSettings.platformName}
          onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
          description="The name displayed across the platform"
        />
        
        <Input
          label="Support Email"
          type="email"
          value={generalSettings.supportEmail}
          onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
          description="Email address for user support"
        />
      </div>

      <Input
        label="Platform Description"
        value={generalSettings.platformDescription}
        onChange={(e) => handleSettingChange('general', 'platformDescription', e.target.value)}
        description="Brief description of the platform"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Input
          label="Max File Upload Size (MB)"
          type="number"
          value={generalSettings.maxFileUploadSize}
          onChange={(e) => handleSettingChange('general', 'maxFileUploadSize', e.target.value)}
          description="Maximum file size for uploads"
        />
        
        <Input
          label="Session Timeout (minutes)"
          type="number"
          value={generalSettings.sessionTimeout}
          onChange={(e) => handleSettingChange('general', 'sessionTimeout', e.target.value)}
          description="User session timeout duration"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-foreground">Platform Controls</h4>
        
        <div className="space-y-3">
          <Checkbox
            label="Maintenance Mode"
            description="Enable to put the platform in maintenance mode"
            checked={generalSettings.maintenanceMode}
            onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
          />
          
          <Checkbox
            label="User Registration"
            description="Allow new users to register on the platform"
            checked={generalSettings.registrationEnabled}
            onChange={(e) => handleSettingChange('general', 'registrationEnabled', e.target.checked)}
          />
          
          <Checkbox
            label="Email Verification Required"
            description="Require email verification for new accounts"
            checked={generalSettings.emailVerificationRequired}
            onChange={(e) => handleSettingChange('general', 'emailVerificationRequired', e.target.checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderFeaturesTab = () => (
    <div className="space-y-6">
      <div className="glassmorphic-surface p-4 rounded-lg">
        <h4 className="text-lg font-medium text-foreground mb-4">Core Features</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Checkbox
            label="AI Career Coach"
            description="Enable AI-powered career coaching"
            checked={featureFlags.aiCoachEnabled}
            onChange={(e) => handleSettingChange('features', 'aiCoachEnabled', e.target.checked)}
          />
          
          <Checkbox
            label="Course Recommendations"
            description="AI-powered course recommendations"
            checked={featureFlags.courseRecommendations}
            onChange={(e) => handleSettingChange('features', 'courseRecommendations', e.target.checked)}
          />
          
          <Checkbox
            label="Job Matching"
            description="Intelligent job matching algorithm"
            checked={featureFlags.jobMatching}
            onChange={(e) => handleSettingChange('features', 'jobMatching', e.target.checked)}
          />
          
          <Checkbox
            label="Forum"
            description="Community forum and discussions"
            checked={featureFlags.forumEnabled}
            onChange={(e) => handleSettingChange('features', 'forumEnabled', e.target.checked)}
          />
        </div>
      </div>

      <div className="glassmorphic-surface p-4 rounded-lg">
        <h4 className="text-lg font-medium text-foreground mb-4">Additional Features</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Checkbox
            label="Video Calls"
            description="Enable video calling functionality"
            checked={featureFlags.videoCallsEnabled}
            onChange={(e) => handleSettingChange('features', 'videoCallsEnabled', e.target.checked)}
          />
          
          <Checkbox
            label="Dark Mode"
            description="Allow users to switch to dark mode"
            checked={featureFlags.darkModeEnabled}
            onChange={(e) => handleSettingChange('features', 'darkModeEnabled', e.target.checked)}
          />
          
          <Checkbox
            label="Push Notifications"
            description="Enable push notifications"
            checked={featureFlags.notificationsEnabled}
            onChange={(e) => handleSettingChange('features', 'notificationsEnabled', e.target.checked)}
          />
          
          <Checkbox
            label="Analytics Tracking"
            description="Enable user analytics and tracking"
            checked={featureFlags.analyticsEnabled}
            onChange={(e) => handleSettingChange('features', 'analyticsEnabled', e.target.checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="glassmorphic-surface p-4 rounded-lg">
        <h4 className="text-lg font-medium text-foreground mb-4">Password Policy</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Input
            label="Minimum Password Length"
            type="number"
            value={securitySettings.passwordMinLength}
            onChange={(e) => handleSettingChange('security', 'passwordMinLength', e.target.value)}
            description="Minimum number of characters"
          />
          
          <Select
            label="Session Security Level"
            options={securityLevelOptions}
            value={securitySettings.sessionSecurityLevel}
            onChange={(value) => handleSettingChange('security', 'sessionSecurityLevel', value)}
            description="Security level for user sessions"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <Checkbox
            label="Require Special Characters"
            checked={securitySettings.passwordRequireSpecialChars}
            onChange={(e) => handleSettingChange('security', 'passwordRequireSpecialChars', e.target.checked)}
          />
          
          <Checkbox
            label="Require Numbers"
            checked={securitySettings.passwordRequireNumbers}
            onChange={(e) => handleSettingChange('security', 'passwordRequireNumbers', e.target.checked)}
          />
          
          <Checkbox
            label="Require Uppercase"
            checked={securitySettings.passwordRequireUppercase}
            onChange={(e) => handleSettingChange('security', 'passwordRequireUppercase', e.target.checked)}
          />
        </div>
      </div>

      <div className="glassmorphic-surface p-4 rounded-lg">
        <h4 className="text-lg font-medium text-foreground mb-4">Login Security</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Input
            label="Max Login Attempts"
            type="number"
            value={securitySettings.maxLoginAttempts}
            onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', e.target.value)}
            description="Maximum failed login attempts before lockout"
          />
          
          <Input
            label="Lockout Duration (minutes)"
            type="number"
            value={securitySettings.lockoutDuration}
            onChange={(e) => handleSettingChange('security', 'lockoutDuration', e.target.value)}
            description="Duration of account lockout"
          />
        </div>
        
        <div className="mt-4">
          <Checkbox
            label="Two-Factor Authentication Required"
            description="Require 2FA for all user accounts"
            checked={securitySettings.twoFactorRequired}
            onChange={(e) => handleSettingChange('security', 'twoFactorRequired', e.target.checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderEmailTab = () => (
    <div className="space-y-6">
      <div className="glassmorphic-surface p-4 rounded-lg">
        <h4 className="text-lg font-medium text-foreground mb-4">SMTP Configuration</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Input
            label="SMTP Host"
            value={emailSettings.smtpHost}
            onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)}
            description="SMTP server hostname"
          />
          
          <Input
            label="SMTP Port"
            type="number"
            value={emailSettings.smtpPort}
            onChange={(e) => handleSettingChange('email', 'smtpPort', e.target.value)}
            description="SMTP server port"
          />
          
          <Input
            label="SMTP Username"
            value={emailSettings.smtpUsername}
            onChange={(e) => handleSettingChange('email', 'smtpUsername', e.target.value)}
            description="SMTP authentication username"
          />
          
          <Input
            label="SMTP Password"
            type="password"
            value={emailSettings.smtpPassword}
            onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
            description="SMTP authentication password"
          />
        </div>
      </div>

      <div className="glassmorphic-surface p-4 rounded-lg">
        <h4 className="text-lg font-medium text-foreground mb-4">Email Settings</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Input
            label="From Email"
            type="email"
            value={emailSettings.fromEmail}
            onChange={(e) => handleSettingChange('email', 'fromEmail', e.target.value)}
            description="Default sender email address"
          />
          
          <Input
            label="From Name"
            value={emailSettings.fromName}
            onChange={(e) => handleSettingChange('email', 'fromName', e.target.value)}
            description="Default sender name"
          />
        </div>
        
        <div className="mt-4">
          <Checkbox
            label="Email Templates Enabled"
            description="Use custom email templates for notifications"
            checked={emailSettings.emailTemplatesEnabled}
            onChange={(e) => handleSettingChange('email', 'emailTemplatesEnabled', e.target.checked)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="outline" iconName="Send">
          Test Email Configuration
        </Button>
        <Button variant="ghost" iconName="Eye">
          Preview Templates
        </Button>
      </div>
    </div>
  );

  const renderApiTab = () => (
    <div className="text-center py-12">
      <Icon name="Code" size={48} className="text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">API Configuration</h3>
      <p className="text-muted-foreground mb-4">Manage API keys, rate limits, and integrations</p>
      <Button iconName="Settings">Configure API</Button>
    </div>
  );

  const renderBackupTab = () => (
    <div className="text-center py-12">
      <Icon name="Database" size={48} className="text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">Backup & Recovery</h3>
      <p className="text-muted-foreground mb-4">Configure automated backups and recovery options</p>
      <div className="flex items-center justify-center space-x-3">
        <Button iconName="Download">Create Backup</Button>
        <Button variant="outline" iconName="Upload">Restore Backup</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Global Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Manage platform-wide settings and configurations
          </p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleResetSettings}
              iconName="RotateCcw"
            >
              Reset
            </Button>
            <Button
              onClick={handleSaveSettings}
              iconName="Save"
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="glassmorphic-surface p-4 rounded-lg border border-warning/30">
          <div className="flex items-center space-x-3">
            <Icon name="AlertTriangle" size={20} className="text-warning" />
            <div>
              <p className="text-sm font-medium text-foreground">You have unsaved changes</p>
              <p className="text-xs text-muted-foreground">
                Don't forget to save your configuration changes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="glassmorphic-surface p-1 rounded-lg">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/30' :'text-muted-foreground hover:text-foreground hover:bg-white/10'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="glassmorphic-card p-6">
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'features' && renderFeaturesTab()}
        {activeTab === 'security' && renderSecurityTab()}
        {activeTab === 'email' && renderEmailTab()}
        {activeTab === 'api' && renderApiTab()}
        {activeTab === 'backup' && renderBackupTab()}
      </div>
    </div>
  );
};

export default GlobalConfigSection;
