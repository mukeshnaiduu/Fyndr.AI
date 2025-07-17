import React from 'react';
import Icon from '../AppIcon';

const ProgressIndicator = ({ 
  currentStep = 1, 
  totalSteps = 5, 
  steps = [], 
  orientation = 'horizontal',
  showLabels = true,
  showPercentage = true,
  className = ''
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  const defaultSteps = Array.from({ length: totalSteps }, (_, i) => ({
    id: i + 1,
    label: `Step ${i + 1}`,
    description: `Step ${i + 1} description`
  }));

  const stepItems = steps.length > 0 ? steps : defaultSteps;

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepIcon = (status, stepNumber) => {
    switch (status) {
      case 'completed':
        return <Icon name="Check" size={16} color="white" />;
      case 'current':
        return <span className="text-sm font-medium text-primary-foreground">{stepNumber}</span>;
      default:
        return <span className="text-sm font-medium text-muted-foreground">{stepNumber}</span>;
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className={`flex flex-col space-y-4 ${className}`}>
        {/* Progress Percentage */}
        {showPercentage && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm font-data text-primary">{percentage}%</span>
          </div>
        )}

        {/* Vertical Steps */}
        {stepItems.map((step, index) => {
          const status = getStepStatus(index + 1);
          const isLast = index === stepItems.length - 1;

          return (
            <div key={step.id} className="flex items-start space-x-3">
              {/* Step Indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                    status === 'completed'
                      ? 'bg-success border-success'
                      : status === 'current' ?'bg-primary border-primary' :'bg-background border-border'
                  }`}
                >
                  {getStepIcon(status, step.id)}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 h-8 mt-2 transition-colors duration-300 ${
                      status === 'completed' ? 'bg-success' : 'bg-border'
                    }`}
                  />
                )}
              </div>

              {/* Step Content */}
              {showLabels && (
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium transition-colors duration-300 ${
                      status === 'current' ?'text-primary'
                        : status === 'completed' ?'text-success' :'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          {showPercentage && (
            <span className="text-sm font-data text-primary">{percentage}%</span>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-gradient-primary h-2 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Horizontal Steps */}
      <div className="flex items-center justify-between">
        {stepItems.map((step, index) => {
          const status = getStepStatus(index + 1);
          const isLast = index === stepItems.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 hover-lift ${
                    status === 'completed'
                      ? 'bg-success border-success'
                      : status === 'current' ?'bg-primary border-primary' :'bg-background border-border'
                  }`}
                >
                  {getStepIcon(status, step.id)}
                </div>
                {showLabels && (
                  <div className="mt-2 text-center">
                    <p
                      className={`text-xs font-medium transition-colors duration-300 ${
                        status === 'current' ?'text-primary'
                          : status === 'completed' ?'text-success' :'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 mx-4">
                  <div
                    className={`h-0.5 transition-colors duration-300 ${
                      status === 'completed' ? 'bg-success' : 'bg-border'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
