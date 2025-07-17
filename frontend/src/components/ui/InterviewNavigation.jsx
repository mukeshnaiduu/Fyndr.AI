import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const InterviewNavigation = () => {
  const [sessionTime, setSessionTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [participantCount, setParticipantCount] = useState(2);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Session timer
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExitInterview = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    // Clean up interview session
    setIsRecording(false);
    navigate('/homepage');
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-success';
      case 'connecting': return 'text-warning';
      case 'disconnected': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return 'Wifi';
      case 'connecting': return 'Loader';
      case 'disconnected': return 'WifiOff';
      default: return 'Wifi';
    }
  };

  return (
    <>
      {/* Interview Header */}
      <header className="fixed top-0 left-0 right-0 z-interview glassmorphic border-b spring-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Session Info */}
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-squircle flex items-center justify-center">
                  <Icon name="Video" size={16} color="white" />
                </div>
                <span className="font-heading font-heading-semibold text-foreground tracking-wide">
                  Interview
                </span>
              </div>

              {/* Session Timer */}
              <div className="flex items-center space-x-2 glassmorphic px-3 py-1.5 rounded-squircle">
                <Icon name="Clock" size={16} className="text-muted-foreground" />
                <span className="font-data text-sm text-foreground">
                  {formatTime(sessionTime)}
                </span>
              </div>

              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <Icon 
                  name={getConnectionStatusIcon()} 
                  size={16} 
                  className={`${getConnectionStatusColor()} ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`}
                />
                <span className={`text-sm font-body font-body-medium capitalize ${getConnectionStatusColor()}`}>
                  {connectionStatus}
                </span>
              </div>

              {/* Participant Count */}
              <div className="flex items-center space-x-2 glassmorphic px-3 py-1.5 rounded-squircle">
                <Icon name="Users" size={16} className="text-muted-foreground" />
                <span className="font-data text-sm text-foreground">
                  {participantCount}
                </span>
              </div>
            </div>

            {/* Center Section - Recording Status */}
            <div className="flex items-center space-x-4">
              {isRecording && (
                <div className="flex items-center space-x-2 bg-error/10 text-error px-3 py-1.5 rounded-squircle">
                  <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
                  <span className="text-sm font-body font-body-medium">
                    Recording
                  </span>
                </div>
              )}
            </div>

            {/* Right Section - Controls */}
            <div className="flex items-center space-x-3">
              {/* Recording Toggle */}
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={toggleRecording}
                iconName={isRecording ? "Square" : "Circle"}
                iconPosition="left"
                iconSize={16}
              >
                {isRecording ? 'Stop' : 'Record'}
              </Button>

              {/* Settings */}
              <Button
                variant="ghost"
                size="icon"
                iconName="Settings"
                iconSize={18}
                className="text-muted-foreground hover:text-foreground"
              />

              {/* Exit Interview */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExitInterview}
                iconName="LogOut"
                iconPosition="left"
                iconSize={16}
                className="text-error hover:text-error border-error/20 hover:border-error/40"
              >
                Exit
              </Button>
            </div>
          </div>
        </div>

        {/* Ambient Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-4 left-1/4 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
          <div className="absolute top-8 right-1/3 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '2s' }}></div>
        </div>
      </header>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-modal bg-black/50 flex items-center justify-center p-4">
          <div className="glassmorphic rounded-squircle p-6 max-w-md w-full elevation-3">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-error/10 rounded-squircle flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-error" />
              </div>
              <div>
                <h3 className="font-heading font-heading-semibold text-foreground">
                  Exit Interview?
                </h3>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to exit the interview? Any ongoing recording will be stopped and the session will end for all participants.
            </p>

            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={cancelExit}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmExit}
                iconName="LogOut"
                iconPosition="left"
                iconSize={16}
              >
                Exit Interview
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InterviewNavigation;
