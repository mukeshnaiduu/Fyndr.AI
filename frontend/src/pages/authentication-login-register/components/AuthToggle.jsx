import React from 'react';
import Button from 'components/ui/Button';

const AuthToggle = ({ activeMode, onModeChange }) => {
  return (
    <div className="flex items-center space-x-1 p-1 bg-muted rounded-lg mb-8">
      <Button
        variant={activeMode === 'login' ? 'default' : 'ghost'}
        size="sm"
        fullWidth
        onClick={() => onModeChange('login')}
        className={`relative spring-transition ${activeMode === 'login' ? 'glow-primary' : ''
          }`}
      >
        Sign In
        {activeMode === 'login' && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"></div>
        )}
      </Button>
      <Button
        variant={activeMode === 'register' ? 'default' : 'ghost'}
        size="sm"
        fullWidth
        onClick={() => onModeChange('register')}
        className={`relative spring-transition ${activeMode === 'register' ? 'glow-primary' : ''
          }`}
      >
        Sign Up
        {activeMode === 'register' && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"></div>
        )}
      </Button>
    </div>
  );
};

export default AuthToggle;
