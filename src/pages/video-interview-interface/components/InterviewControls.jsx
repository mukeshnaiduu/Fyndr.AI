import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const InterviewControls = ({
  onEndInterview,
  isRecording,
  onToggleRecording,
  sessionTime,
  participants
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [volume, setVolume] = useState(75);
  const [showParticipants, setShowParticipants] = useState(false);
  const [timerMode, setTimerMode] = useState('elapsed'); // 'elapsed' or 'countdown'
  const [countdownTime, setCountdownTime] = useState(3600); // 1 hour in seconds

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerDisplay = () => {
    if (timerMode === 'countdown') {
      const remaining = Math.max(0, countdownTime - sessionTime);
      return formatTime(remaining);
    }
    return formatTime(sessionTime);
  };

  const getTimerColor = () => {
    if (timerMode === 'countdown') {
      const remaining = countdownTime - sessionTime;
      if (remaining <= 300) return 'text-error'; // 5 minutes
      if (remaining <= 600) return 'text-warning'; // 10 minutes
    }
    return 'text-foreground';
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleCameraToggle = () => {
    setIsCameraOff(!isCameraOff);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseInt(e.target.value));
  };

  const handleTimerModeToggle = () => {
    setTimerMode(timerMode === 'elapsed' ? 'countdown' : 'elapsed');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-controls glassmorphic border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Timer */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleTimerModeToggle}
              className="flex items-center space-x-2 glassmorphic px-4 py-2 rounded-squircle hover:bg-muted spring-transition"
            >
              <Icon
                name={timerMode === 'countdown' ? 'Timer' : 'Clock'}
                size={16}
                className="text-muted-foreground"
              />
              <span className={`font-data text-lg font-heading-semibold ${getTimerColor()}`}>
                {getTimerDisplay()}
              </span>
              <span className="text-xs text-muted-foreground">
                {timerMode === 'countdown' ? 'remaining' : 'elapsed'}
              </span>
            </button>

            {/* Participants */}
            <div className="relative">
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="flex items-center space-x-2 glassmorphic px-3 py-2 rounded-squircle hover:bg-muted spring-transition"
              >
                <Icon name="Users" size={16} className="text-muted-foreground" />
                <span className="text-sm font-body font-body-medium text-foreground">
                  {participants.length}
                </span>
              </button>

              {/* Participants Dropdown */}
              {showParticipants && (
                <>
                  <div
                    className="fixed inset-0 z-dropdown"
                    onClick={() => setShowParticipants(false)}
                  />
                  <div className="absolute bottom-full left-0 mb-2 w-64 glassmorphic dark:glassmorphic-dark rounded-squircle elevation-3 z-dropdown border">
                    <div className="p-3 border-b border-border">
                      <h4 className="font-heading font-heading-semibold text-foreground dark:text-foreground-dark">
                        Participants ({participants.length})
                      </h4>
                    </div>
                    <div className="p-2 space-y-1">
                      {participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center space-x-3 p-2 rounded-squircle hover:bg-muted dark:hover:bg-muted-dark"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent dark:from-primary-dark dark:to-accent-dark rounded-full flex items-center justify-center">
                            <span className="text-xs font-heading font-heading-bold text-white dark:text-white">
                              {participant.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-body font-body-medium text-foreground dark:text-foreground-dark">
                              {participant.name}
                            </p>
                            <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                              {participant.role}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-success dark:bg-success-dark rounded-full"></div>
                            <span className="text-xs text-success dark:text-success-dark">Online</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center Section - Main Controls */}
          <div className="flex items-center space-x-3">
            {/* Mute Toggle */}
            <Button
              variant={isMuted ? "destructive" : "outline"}
              size="icon"
              onClick={handleMuteToggle}
              iconName={isMuted ? "MicOff" : "Mic"}
              iconSize={20}
              className="glassmorphic"
            />

            {/* Camera Toggle */}
            <Button
              variant={isCameraOff ? "destructive" : "outline"}
              size="icon"
              onClick={handleCameraToggle}
              iconName={isCameraOff ? "VideoOff" : "Video"}
              iconSize={20}
              className="glassmorphic focus-visible:ring-2 focus-visible:ring-primary dark:glassmorphic-dark"
            />

            {/* Recording Toggle */}
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="lg"
              onClick={onToggleRecording}
              iconName={isRecording ? "Square" : "Circle"}
              iconPosition="left"
              iconSize={20}
              className="glassmorphic focus-visible:ring-2 focus-visible:ring-primary dark:glassmorphic-dark"
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>

            {/* Volume Control */}
            <div className="flex items-center space-x-2 glassmorphic dark:glassmorphic-dark px-3 py-2 rounded-squircle">
              <Icon
                name={volume === 0 ? "VolumeX" : volume < 50 ? "Volume1" : "Volume2"}
                size={16}
                className="text-muted-foreground dark:text-muted-foreground-dark"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-muted dark:bg-muted-dark rounded-full appearance-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
              />
              <span className="text-xs text-muted-foreground dark:text-muted-foreground-dark font-data w-8">
                {volume}%
              </span>
            </div>
          </div>

          {/* Right Section - End Interview */}
          <div className="flex items-center space-x-3">
            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              iconName="Settings"
              iconSize={18}
              className="glassmorphic text-muted-foreground hover:text-foreground"
            />

            {/* End Interview */}
            <Button
              variant="destructive"
              onClick={onEndInterview}
              iconName="PhoneOff"
              iconPosition="left"
              iconSize={16}
              className="glassmorphic"
            >
              End Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className="flex items-center space-x-2 bg-error text-error-foreground dark:bg-error-dark dark:text-error-foreground-dark px-4 py-2 rounded-t-squircle">
            <div className="w-2 h-2 bg-white dark:bg-error-foreground-dark rounded-full animate-pulse"></div>
            <span className="text-sm font-body font-body-medium">
              Recording in progress
            </span>
          </div>
        </div>
      )}

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-4 left-1/4 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute top-8 right-1/3 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '3s' }}></div>
      </div>
    </div>
  );
};

export default InterviewControls;
