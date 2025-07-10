import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const RoleSwitcher = ({ 
  currentRole = 'job-seeker',
  onRoleChange = () => {},
  availableRoles = ['job-seeker', 'recruiter', 'employer'],
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roleConfig = {
    'job-seeker': {
      label: 'Job Seeker',
      icon: 'User',
      description: 'Find your next opportunity',
      color: 'text-accent'
    },
    'recruiter': {
      label: 'Recruiter',
      icon: 'UserCheck',
      description: 'Discover top talent',
      color: 'text-primary'
    },
    'employer': {
      label: 'Employer',
      icon: 'Building',
      description: 'Manage your team',
      color: 'text-secondary'
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (role) => {
    if (role !== currentRole) {
      onRoleChange(role);
    }
    setIsOpen(false);
  };

  const currentRoleConfig = roleConfig[currentRole];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Role Switcher Trigger */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 hover:bg-muted transition-colors"
      >
        <div className={`p-1.5 rounded-lg bg-gradient-primary`}>
          <Icon name={currentRoleConfig.icon} size={16} color="white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">
            {currentRoleConfig.label}
          </p>
          <p className="text-xs text-muted-foreground">
            {currentRoleConfig.description}
          </p>
        </div>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 glass-card border border-glass-border rounded-card shadow-glass z-50 animate-fade-in">
          <div className="p-2">
            <div className="px-3 py-2 border-b border-glass-border mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Switch Role
              </p>
            </div>

            {availableRoles.map((role) => {
              const config = roleConfig[role];
              const isActive = role === currentRole;

              return (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-card text-left transition-all duration-200 hover-lift ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-elevation-1' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    isActive 
                      ? 'bg-white/20' :'bg-gradient-primary'
                  }`}>
                    <Icon 
                      name={config.icon} 
                      size={16} 
                      color={isActive ? 'white' : 'white'}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-primary-foreground' : 'text-foreground'
                    }`}>
                      {config.label}
                    </p>
                    <p className={`text-xs ${
                      isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }`}>
                      {config.description}
                    </p>
                  </div>

                  {isActive && (
                    <Icon name="Check" size={16} color="white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Role Benefits */}
          <div className="border-t border-glass-border p-3">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={14} className="text-accent mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Each role provides access to different features and workflows tailored to your needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default RoleSwitcher;
