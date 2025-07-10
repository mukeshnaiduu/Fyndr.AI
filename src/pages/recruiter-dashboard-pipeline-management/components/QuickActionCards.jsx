import React from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const QuickActionCards = () => {
  const quickActions = [
    {
      id: 1,
      title: 'Post New Job',
      description: 'Create and publish a new job posting',
      icon: 'Plus',
      color: 'primary',
      action: () => console.log('Post new job'),
      count: null
    },
    {
      id: 2,
      title: 'Schedule Interviews',
      description: 'Manage upcoming interview schedules',
      icon: 'Calendar',
      color: 'success',
      action: () => console.log('Schedule interviews'),
      count: 8
    },
    {
      id: 3,
      title: 'Send Messages',
      description: 'Communicate with candidates',
      icon: 'Mail',
      color: 'warning',
      action: () => console.log('Send messages'),
      count: 12
    },
    {
      id: 4,
      title: 'Generate Reports',
      description: 'Create hiring analytics reports',
      icon: 'BarChart3',
      color: 'accent',
      action: () => console.log('Generate reports'),
      count: null
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: 'text-primary bg-primary/10 hover:bg-primary/20',
      success: 'text-success bg-success/10 hover:bg-success/20',
      warning: 'text-warning bg-warning/10 hover:bg-warning/20',
      accent: 'text-accent bg-accent/10 hover:bg-accent/20',
      error: 'text-error bg-error/10 hover:bg-error/20'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickActions.map((action) => (
        <div
          key={action.id}
          className="glassmorphic-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer group"
          onClick={action.action}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${getColorClasses(action.color)}`}>
              <Icon name={action.icon} size={24} />
            </div>
            {action.count && (
              <div className="bg-error text-error-foreground text-xs font-medium px-2 py-1 rounded-full animate-pulse">
                {action.count}
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
              {action.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {action.description}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            iconName="ArrowRight"
            iconPosition="right"
            className="w-full justify-between hover:bg-white/10"
          >
            Get Started
          </Button>
        </div>
      ))}
    </div>
  );
};

export default QuickActionCards;
