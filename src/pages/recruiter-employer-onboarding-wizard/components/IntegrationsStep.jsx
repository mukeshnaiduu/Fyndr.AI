import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import { Checkbox } from 'components/ui/Checkbox';

const IntegrationsStep = ({ data, onUpdate, onNext, onPrev }) => {
  const [formData, setFormData] = useState({
    selectedIntegrations: data.selectedIntegrations || [],
    hrisSystem: data.hrisSystem || null,
    atsSystem: data.atsSystem || null,
    ...data
  });

  const [connectionStatus, setConnectionStatus] = useState({});
  const [isConnecting, setIsConnecting] = useState({});

  const hrisIntegrations = [
    {
      id: 'workday',
      name: 'Workday',
      description: 'Sync employee data and organizational structure',
      icon: 'Building2',
      status: 'available',
      features: ['Employee sync', 'Org chart', 'Role management', 'Reporting']
    },
    {
      id: 'bamboohr',
      name: 'BambooHR',
      description: 'Streamline HR processes and employee management',
      icon: 'Users',
      status: 'available',
      features: ['Employee records', 'Time tracking', 'Performance reviews', 'Benefits']
    },
    {
      id: 'adp',
      name: 'ADP Workforce',
      description: 'Payroll and workforce management integration',
      icon: 'CreditCard',
      status: 'available',
      features: ['Payroll sync', 'Tax management', 'Benefits admin', 'Compliance']
    },
    {
      id: 'successfactors',
      name: 'SAP SuccessFactors',
      description: 'Enterprise HR and talent management',
      icon: 'Briefcase',
      status: 'available',
      features: ['Talent management', 'Learning', 'Performance', 'Analytics']
    }
  ];

  const atsIntegrations = [
    {
      id: 'greenhouse',
      name: 'Greenhouse',
      description: 'Comprehensive applicant tracking system',
      icon: 'Leaf',
      status: 'available',
      features: ['Candidate tracking', 'Interview scheduling', 'Reporting', 'Compliance']
    },
    {
      id: 'lever',
      name: 'Lever',
      description: 'Modern recruiting platform',
      icon: 'Target',
      status: 'available',
      features: ['CRM', 'Analytics', 'Automation', 'Collaboration']
    },
    {
      id: 'jobvite',
      name: 'Jobvite',
      description: 'Talent acquisition suite',
      icon: 'UserPlus',
      status: 'available',
      features: ['Social recruiting', 'Referrals', 'Analytics', 'Onboarding']
    }
  ];

  const otherIntegrations = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and notifications',
      icon: 'MessageSquare',
      status: 'available',
      features: ['Notifications', 'Team updates', 'Bot integration', 'Channels']
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Collaboration and video interviews',
      icon: 'Video',
      status: 'available',
      features: ['Video calls', 'Chat', 'File sharing', 'Calendar sync']
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Video interviewing platform',
      icon: 'Camera',
      status: 'available',
      features: ['Video interviews', 'Recording', 'Screen sharing', 'Scheduling']
    },
    {
      id: 'calendly',
      name: 'Calendly',
      description: 'Interview scheduling automation',
      icon: 'Calendar',
      status: 'available',
      features: ['Auto-scheduling', 'Calendar sync', 'Reminders', 'Time zones']
    }
  ];

  const handleIntegrationToggle = (integrationId) => {
    setFormData(prev => ({
      ...prev,
      selectedIntegrations: prev.selectedIntegrations.includes(integrationId)
        ? prev.selectedIntegrations.filter(id => id !== integrationId)
        : [...prev.selectedIntegrations, integrationId]
    }));
  };

  const handleConnect = async (integrationId) => {
    setIsConnecting(prev => ({ ...prev, [integrationId]: true }));
    
    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus(prev => ({ ...prev, [integrationId]: 'connected' }));
      setIsConnecting(prev => ({ ...prev, [integrationId]: false }));
    }, 2000);
  };

  const handleDisconnect = (integrationId) => {
    setConnectionStatus(prev => ({ ...prev, [integrationId]: 'disconnected' }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'disconnected': return 'text-error';
      case 'pending': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return 'CheckCircle';
      case 'disconnected': return 'XCircle';
      case 'pending': return 'Clock';
      default: return 'Circle';
    }
  };

  const IntegrationCard = ({ integration, category }) => {
    const isSelected = formData.selectedIntegrations.includes(integration.id);
    const status = connectionStatus[integration.id] || 'available';
    const isLoading = isConnecting[integration.id];

    return (
      <div className={`glass-card p-6 rounded-card transition-all duration-300 hover-lift ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Icon name={integration.icon} size={20} color="white" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{integration.name}</h4>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Icon 
              name={getStatusIcon(status)} 
              size={16} 
              className={getStatusColor(status)} 
            />
            <span className={`text-xs font-medium ${getStatusColor(status)}`}>
              {status === 'available' ? 'Available' : status}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Features:</p>
          <div className="flex flex-wrap gap-1">
            {integration.features.map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-muted text-xs text-muted-foreground rounded"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Checkbox
            label="Enable integration"
            checked={isSelected}
            onChange={() => handleIntegrationToggle(integration.id)}
          />
          
          {isSelected && (
            <div className="flex space-x-2">
              {status === 'connected' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(integration.id)}
                  iconName="Unlink"
                  iconPosition="left"
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  loading={isLoading}
                  onClick={() => handleConnect(integration.id)}
                  iconName="Link"
                  iconPosition="left"
                >
                  Connect
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleNext = () => {
    onUpdate(formData);
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Integrations</h2>
        <p className="text-muted-foreground">
          Connect your existing tools and systems to streamline your hiring workflow
        </p>
      </div>

      {/* HRIS Systems */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <Icon name="Database" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">HRIS Systems</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hrisIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              category="hris"
            />
          ))}
        </div>
      </div>

      {/* ATS Systems */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <Icon name="Users" size={20} className="text-secondary" />
          <h3 className="text-lg font-semibold text-foreground">Applicant Tracking Systems</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {atsIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              category="ats"
            />
          ))}
        </div>
      </div>

      {/* Communication & Scheduling */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <Icon name="MessageCircle" size={20} className="text-accent" />
          <h3 className="text-lg font-semibold text-foreground">Communication & Scheduling</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {otherIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              category="communication"
            />
          ))}
        </div>
      </div>

      {/* Integration Summary */}
      {formData.selectedIntegrations.length > 0 && (
        <div className="glass-card p-6 rounded-card bg-primary/5 border-primary/20">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={20} className="text-primary mt-1" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Integration Summary</h4>
              <p className="text-sm text-muted-foreground mb-3">
                You have selected {formData.selectedIntegrations.length} integration(s). 
                These will be configured after completing the onboarding process.
              </p>
              <div className="flex flex-wrap gap-2">
                {formData.selectedIntegrations.map((id) => {
                  const integration = [...hrisIntegrations, ...atsIntegrations, ...otherIntegrations]
                    .find(int => int.id === id);
                  return (
                    <span
                      key={id}
                      className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {integration?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} iconName="ChevronLeft" iconPosition="left">
          Previous
        </Button>
        <Button onClick={handleNext} iconName="ChevronRight" iconPosition="right">
          Next: Billing
        </Button>
      </div>
    </div>
  );
};

export default IntegrationsStep;
