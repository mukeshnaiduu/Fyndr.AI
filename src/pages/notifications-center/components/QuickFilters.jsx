import React from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const QuickFilters = ({ activeFilter, onFilterChange, counts }) => {
  const quickFilters = [
    {
      id: 'all',
      label: 'All Notifications',
      icon: 'Bell',
      count: counts.total,
      color: 'text-foreground'
    },
    {
      id: 'unread',
      label: 'Unread',
      icon: 'Mail',
      count: counts.unread,
      color: 'text-primary'
    },
    {
      id: 'interview',
      label: 'Interviews',
      icon: 'Calendar',
      count: counts.interview,
      color: 'text-accent'
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: 'FileText',
      count: counts.application,
      color: 'text-success'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: 'MessageCircle',
      count: counts.message,
      color: 'text-warning'
    },
    {
      id: 'archived',
      label: 'Archived',
      icon: 'Archive',
      count: counts.archived,
      color: 'text-muted-foreground'
    }
  ];

  return (
    <div className="glassmorphic rounded-squircle p-4 border elevation-1">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Zap" size={20} className="text-muted-foreground" />
        <h3 className="font-heading font-heading-semibold text-foreground">
          Quick Filters
        </h3>
      </div>

      <div className="space-y-2">
        {quickFilters.map((filter, index) => (
          <motion.button
            key={filter.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onFilterChange(filter.id)}
            className={`w-full flex items-center justify-between p-3 rounded-squircle spring-transition group ${
              activeFilter === filter.id
                ? 'bg-primary text-primary-foreground glow-primary'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon 
                name={filter.icon} 
                size={16} 
                className={`${
                  activeFilter === filter.id 
                    ? 'text-primary-foreground' 
                    : `${filter.color} group-hover:scale-110 spring-transition`
                }`}
              />
              <span className="text-sm font-body font-body-medium">
                {filter.label}
              </span>
            </div>
            <span className={`text-sm font-data px-2 py-1 rounded-full ${
              activeFilter === filter.id
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}>
              {filter.count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Settings Section */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="text-xs font-caption font-body-medium text-muted-foreground uppercase tracking-wide mb-3">
          Settings
        </h4>
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            iconName="Settings"
            iconPosition="left"
            iconSize={14}
            className="justify-start"
          >
            Notification Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            iconName="Download"
            iconPosition="left"
            iconSize={14}
            className="justify-start"
          >
            Export History
          </Button>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            iconName="Trash2"
            iconPosition="left"
            iconSize={14}
            className="justify-start text-error hover:text-error"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-squircle">
        <div className="absolute top-6 left-6 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute bottom-6 right-6 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '3s' }}></div>
      </div>
    </div>
  );
};

export default QuickFilters;
