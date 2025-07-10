import React from 'react';
import Icon from 'components/AppIcon';

const LoadingOverlay = ({ isVisible, message = "Authenticating..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-modal bg-black/50 flex items-center justify-center p-4">
      <div className="glassmorphic rounded-squircle p-8 max-w-sm w-full elevation-3 text-center">
        <div className="flex flex-col items-center space-y-4">
          {/* Animated Logo */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-squircle flex items-center justify-center glow-primary animate-pulse">
              <Icon name="Zap" size={32} color="white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full animate-bounce"></div>
          </div>

          {/* Loading Animation */}
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>

          {/* Loading Message */}
          <div className="space-y-2">
            <h3 className="font-heading font-heading-semibold text-foreground">
              {message}
            </h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your request...
            </p>
          </div>

          {/* Shimmer Effect */}
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
          </div>
        </div>

        {/* Ambient Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-squircle">
          <div className="absolute top-4 left-4 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
          <div className="absolute top-8 right-6 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-6 left-8 w-1 h-1 bg-secondary/25 rounded-full particle-float" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
