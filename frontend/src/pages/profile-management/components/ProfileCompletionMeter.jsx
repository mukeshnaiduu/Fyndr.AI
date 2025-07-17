import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';

const ProfileCompletionMeter = ({ userProfile }) => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [completionItems, setCompletionItems] = useState([]);

  useEffect(() => {
    calculateCompletion();
  }, [userProfile]);

  const calculateCompletion = () => {
    const items = [
      {
        id: 'avatar',
        label: 'Profile Photo',
        completed: !!userProfile.avatar,
        weight: 10
      },
      {
        id: 'basicInfo',
        label: 'Basic Information',
        completed: !!(userProfile.firstName && userProfile.lastName && userProfile.email),
        weight: 15
      },
      {
        id: 'bio',
        label: 'Bio/Description',
        completed: !!(userProfile.bio && userProfile.bio.length > 50),
        weight: 10
      },
      {
        id: 'contact',
        label: 'Contact Details',
        completed: !!(userProfile.phone && userProfile.location),
        weight: 10
      },
      {
        id: 'professional',
        label: 'Professional Details',
        completed: !!(userProfile.jobTitle && userProfile.company),
        weight: 20
      },
      {
        id: 'skills',
        label: 'Skills & Expertise',
        completed: !!(userProfile.skills && userProfile.skills.length >= 3),
        weight: 15
      },
      {
        id: 'experience',
        label: 'Experience Level',
        completed: !!userProfile.experience,
        weight: 10
      },
      {
        id: 'preferences',
        label: 'Job Preferences',
        completed: !!(userProfile.preferences && userProfile.preferences.jobPreferences),
        weight: 10
      }
    ];

    // Add role-specific items
    if (userProfile.role === 'jobseeker') {
      items.push({
        id: 'resume',
        label: 'Resume Upload',
        completed: !!userProfile.resume,
        weight: 15
      });
      items.push({
        id: 'portfolio',
        label: 'Portfolio Link',
        completed: !!userProfile.portfolio,
        weight: 5
      });
    }

    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const completedWeight = items
      .filter(item => item.completed)
      .reduce((sum, item) => sum + item.weight, 0);

    const percentage = Math.round((completedWeight / totalWeight) * 100);

    setCompletionItems(items);
    setCompletionPercentage(percentage);
  };

  const getCompletionColor = () => {
    if (completionPercentage >= 80) return 'text-success';
    if (completionPercentage >= 60) return 'text-accent';
    if (completionPercentage >= 40) return 'text-warning';
    return 'text-error';
  };

  const getCompletionBgColor = () => {
    if (completionPercentage >= 80) return 'stroke-success';
    if (completionPercentage >= 60) return 'stroke-accent';
    if (completionPercentage >= 40) return 'stroke-warning';
    return 'stroke-error';
  };

  const getCompletionMessage = () => {
    if (completionPercentage >= 90) return 'Excellent! Your profile is almost complete.';
    if (completionPercentage >= 70) return 'Great progress! A few more details to go.';
    if (completionPercentage >= 50) return 'Good start! Keep adding more information.';
    return 'Let\'s complete your profile to attract better opportunities.';
  };

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="glassmorphic p-6 rounded-squircle">
      <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
        <Icon name="Target" size={20} className="mr-2" />
        Profile Completion
      </h3>

      <div className="flex items-center space-x-6">
        {/* Circular Progress */}
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted opacity-20"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className={`${getCompletionBgColor()} spring-transition`}
              style={{
                transition: 'stroke-dashoffset 1s ease-in-out'
              }}
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-heading font-heading-bold ${getCompletionColor()}`}>
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Completion Info */}
        <div className="flex-1">
          <h4 className={`font-body font-body-semibold text-lg ${getCompletionColor()} mb-2`}>
            {completionPercentage}% Complete
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            {getCompletionMessage()}
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div
              className={`h-2 rounded-full spring-transition ${
                completionPercentage >= 80 ? 'bg-success' :
                completionPercentage >= 60 ? 'bg-accent' :
                completionPercentage >= 40 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ 
                width: `${completionPercentage}%`,
                transition: 'width 1s ease-in-out'
              }}
            />
          </div>

          {/* Next Steps */}
          <div className="space-y-2">
            <h5 className="text-sm font-body font-body-medium text-foreground">
              Next steps to improve your profile:
            </h5>
            <div className="space-y-1">
              {completionItems
                .filter(item => !item.completed)
                .slice(0, 3)
                .map((item) => (
                  <div key={item.id} className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Icon name="Circle" size={12} />
                    <span>{item.label}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Checklist */}
      <div className="mt-6 pt-4 border-t border-border">
        <h5 className="text-sm font-body font-body-medium text-foreground mb-3">
          Profile Checklist
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {completionItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center space-x-2 text-xs p-2 rounded ${
                item.completed ? 'text-success bg-success/5' : 'text-muted-foreground'
              }`}
            >
              <Icon 
                name={item.completed ? "CheckCircle" : "Circle"} 
                size={14} 
                className={item.completed ? 'text-success' : 'text-muted-foreground'}
              />
              <span>{item.label}</span>
              <span className="ml-auto text-xs opacity-60">
                {item.weight}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionMeter;
