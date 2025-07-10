import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const JobDescription = ({ description, responsibilities, requirements }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Description', icon: 'FileText' },
    { id: 'responsibilities', label: 'Responsibilities', icon: 'CheckSquare' },
    { id: 'requirements', label: 'Requirements', icon: 'List' }
  ];

  const truncateText = (text, maxLength = 300) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {isExpanded ? description : truncateText(description)}
            </p>
            {description.length > 300 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
              >
                {isExpanded ? 'Show Less' : 'Read More'}
                <Icon 
                  name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                  size={16} 
                  className="ml-1" 
                />
              </Button>
            )}
          </div>
        );
      
      case 'responsibilities':
        return (
          <ul className="space-y-3">
            {responsibilities.map((item, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-muted-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        );
      
      case 'requirements':
        return (
          <ul className="space-y-3">
            {requirements.map((item, index) => (
              <li key={index} className="flex items-start space-x-3">
                <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="glass-card p-6 mb-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-muted rounded-card p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded text-sm font-medium transition-all duration-200 flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab.icon} size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {renderContent()}
      </div>

      {/* Reading Progress */}
      <div className="mt-6 pt-4 border-t border-glass-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Reading Progress</span>
          <span>85% Complete</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1 mt-2">
          <div className="bg-gradient-primary h-1 rounded-full transition-all duration-500 w-[85%]"></div>
        </div>
      </div>
    </div>
  );
};

export default JobDescription;
