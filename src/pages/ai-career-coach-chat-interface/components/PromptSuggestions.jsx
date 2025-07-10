import React from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const PromptSuggestions = ({ onSelectPrompt, visible = true }) => {
  const suggestions = [
    {
      id: 1,
      text: "Review my resume",
      icon: "FileText",
      category: "resume"
    },
    {
      id: 2,
      text: "Find relevant jobs",
      icon: "Search",
      category: "jobs"
    },
    {
      id: 3,
      text: "Improve my skills",
      icon: "TrendingUp",
      category: "skills"
    },
    {
      id: 4,
      text: "Interview preparation",
      icon: "MessageSquare",
      category: "interview"
    },
    {
      id: 5,
      text: "Career path guidance",
      icon: "Map",
      category: "career"
    },
    {
      id: 6,
      text: "Salary negotiation tips",
      icon: "DollarSign",
      category: "salary"
    },
    {
      id: 7,
      text: "Network building advice",
      icon: "Users",
      category: "networking"
    },
    {
      id: 8,
      text: "Work-life balance",
      icon: "Scale",
      category: "balance"
    }
  ];

  if (!visible) return null;

  return (
    <div className="p-4 border-b border-white/10">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-foreground mb-1">Quick Start</h3>
        <p className="text-xs text-muted-foreground">Choose a topic to begin your career coaching session</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion.id}
            variant="outline"
            size="sm"
            onClick={() => onSelectPrompt(suggestion.text)}
            className="flex items-center space-x-2 text-xs hover:scale-105 transition-all duration-200"
          >
            <Icon name={suggestion.icon} size={14} />
            <span>{suggestion.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PromptSuggestions;
