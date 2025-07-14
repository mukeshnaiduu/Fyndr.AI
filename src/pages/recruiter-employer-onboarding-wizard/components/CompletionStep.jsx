import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const CompletionStep = ({ data }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const setupSteps = [
    { label: 'Creating your workspace', icon: 'Building', status: 'completed' },
    { label: 'Setting up team permissions', icon: 'Users', status: 'completed' },
    { label: 'Configuring integrations', icon: 'Link', status: 'completed' },
    { label: 'Activating your subscription', icon: 'CreditCard', status: 'completed' },
    { label: 'Sending team invitations', icon: 'Mail', status: 'completed' }
  ];

  const nextSteps = [
    {
      title: 'Create Your First Job Posting',
      description: 'Start attracting top talent with AI-powered job descriptions',
      icon: 'Briefcase',
      link: '/job-detail-view',
      color: 'bg-primary'
    },
    {
      title: 'Invite Team Members',
      description: 'Add your colleagues and configure their roles',
      icon: 'UserPlus',
      link: '/team-management-dashboard',
      color: 'bg-secondary'
    },
    {
      title: 'Explore AI Features',
      description: 'Discover how AI can enhance your hiring process',
      icon: 'Zap',
      link: '/ai-powered-job-feed-dashboard',
      color: 'bg-accent'
    }
  ];

  useEffect(() => {
    // Trigger confetti animation
    setShowConfetti(true);

    // Animate setup steps
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < setupSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div className={`w-2 h-2 rounded-full ${['bg-primary', 'bg-secondary', 'bg-accent', 'bg-success'][Math.floor(Math.random() * 4)]
                }`} />
            </div>
          ))}
        </div>
      )}

      {/* Success Header */}
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Icon name="Check" size={48} color="white" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4">
          Welcome to Fyndr.AI! 🎉
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          Your account has been successfully set up
        </p>
        <p className="text-muted-foreground">
          {data.companyName} is now ready to revolutionize your hiring process
        </p>
      </div>

      {/* Setup Progress */}
      <div className="p-6 rounded-card bg-white dark:glass-card">
        <h3 className="text-lg font-semibold text-foreground mb-6">Setup Complete</h3>

        <div className="space-y-4">
          {setupSteps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 transition-all duration-500 ${index <= currentStep ? 'opacity-100' : 'opacity-50'
                }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${index <= currentStep ? 'bg-success' : 'bg-muted'
                }`}>
                <Icon
                  name={index <= currentStep ? 'Check' : step.icon}
                  size={16}
                  color={index <= currentStep ? 'white' : 'currentColor'}
                />
              </div>
              <span className={`text-sm font-medium ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Account Summary */}
      <div className="glass-card p-6 rounded-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Account Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Company:</span>
              <span className="text-foreground font-medium">{data.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan:</span>
              <span className="text-foreground font-medium capitalize">{data.selectedPlan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Billing:</span>
              <span className="text-foreground font-medium capitalize">{data.billingCycle}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Team Members:</span>
              <span className="text-foreground font-medium">
                {data.inviteEmails?.filter(email => email.trim()).length || 0} invited
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Integrations:</span>
              <span className="text-foreground font-medium">
                {data.selectedIntegrations?.length || 0} selected
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trial Period:</span>
              <span className="text-foreground font-medium">14 days remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-6">Recommended Next Steps</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {nextSteps.map((step, index) => (
            <Link
              key={index}
              to={step.link}
              className="glass-card p-6 rounded-card hover-lift transition-all duration-300 group"
            >
              <div className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon name={step.icon} size={24} color="white" />
              </div>

              <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {step.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>

              <div className="flex items-center space-x-1 mt-4 text-primary group-hover:translate-x-1 transition-transform duration-300">
                <span className="text-sm font-medium">Get started</span>
                <Icon name="ArrowRight" size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Support Resources */}
      <div className="p-6 rounded-card bg-white dark:bg-accent/5 dark:border-accent/20 dark:glass-card">
        <div className="flex items-start space-x-3">
          <Icon name="HelpCircle" size={20} className="text-accent mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-2">Need Help Getting Started?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Our team is here to help you make the most of Fyndr.AI. Access our resources or contact support.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" iconName="Book" iconPosition="left">
                Documentation
              </Button>
              <Button variant="outline" size="sm" iconName="Video" iconPosition="left">
                Video Tutorials
              </Button>
              <Button variant="outline" size="sm" iconName="MessageCircle" iconPosition="left">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main CTA */}
      <div className="text-center pt-6">
        <Link to="/ai-powered-job-feed-dashboard">
          <Button size="lg" iconName="ArrowRight" iconPosition="right" className="px-8">
            Go to Dashboard
          </Button>
        </Link>

        <p className="text-sm text-muted-foreground mt-4">
          Ready to transform your hiring process? Let's get started!
        </p>
      </div>
    </div>
  );
};

export default CompletionStep;
