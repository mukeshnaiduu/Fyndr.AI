import React, { useState, useEffect, useRef } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const VideoFeed = ({ 
  participant, 
  isLocal = false, 
  isPictureInPicture = false,
  onTogglePiP,
  isRecording = false 
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const videoRef = useRef(null);

  useEffect(() => {
    // Simulate connection quality changes
    const interval = setInterval(() => {
      const qualities = ['excellent', 'good', 'fair', 'poor'];
      setConnectionQuality(qualities[Math.floor(Math.random() * qualities.length)]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleCameraToggle = () => {
    setIsCameraOff(!isCameraOff);
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-primary';
      case 'fair': return 'text-warning';
      case 'poor': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getQualityIcon = () => {
    switch (connectionQuality) {
      case 'excellent': return 'Wifi';
      case 'good': return 'Wifi';
      case 'fair': return 'WifiOff';
      case 'poor': return 'WifiOff';
      default: return 'Wifi';
    }
  };

  return (
    <div className={`relative glassmorphic rounded-squircle overflow-hidden group ${
      isPictureInPicture 
        ? 'w-64 h-48 fixed bottom-4 right-4 z-video border-2 border-primary' :'w-full h-full'
    }`}>
      {/* Video Element */}
      <div 
        ref={videoRef}
        className="w-full h-full bg-gradient-to-br from-muted to-card flex items-center justify-center relative overflow-hidden"
      >
        {isCameraOff ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-2xl font-heading font-heading-bold text-white">
                {participant.name.charAt(0)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Camera is off</p>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl font-heading font-heading-bold text-white">
                  {participant.name.charAt(0)}
                </span>
              </div>
              <p className="text-sm text-foreground font-body font-body-medium">
                {participant.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {participant.role}
              </p>
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-error/90 text-white px-3 py-1.5 rounded-squircle">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-xs font-body font-body-medium">REC</span>
          </div>
        )}

        {/* Connection Quality */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 glassmorphic px-2 py-1 rounded-squircle">
          <Icon 
            name={getQualityIcon()} 
            size={14} 
            className={getQualityColor()}
          />
          <span className={`text-xs font-data ${getQualityColor()}`}>
            {connectionQuality}
          </span>
        </div>

        {/* Participant Name Overlay */}
        <div className="absolute bottom-4 left-4 glassmorphic px-3 py-1.5 rounded-squircle">
          <p className="text-sm font-body font-body-medium text-foreground">
            {participant.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {participant.role}
          </p>
        </div>

        {/* Mute Indicator */}
        {isMuted && (
          <div className="absolute bottom-4 right-4 w-8 h-8 bg-error/90 rounded-full flex items-center justify-center">
            <Icon name="MicOff" size={16} color="white" />
          </div>
        )}
      </div>

      {/* Video Controls Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 spring-transition flex items-center justify-center">
        <div className="flex items-center space-x-3">
          {/* Mute Toggle */}
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            onClick={handleMuteToggle}
            iconName={isMuted ? "MicOff" : "Mic"}
            iconSize={18}
            className="glassmorphic"
          />

          {/* Camera Toggle */}
          <Button
            variant={isCameraOff ? "destructive" : "outline"}
            size="icon"
            onClick={handleCameraToggle}
            iconName={isCameraOff ? "VideoOff" : "Video"}
            iconSize={18}
            className="glassmorphic"
          />

          {/* Picture in Picture */}
          {!isPictureInPicture && (
            <Button
              variant="outline"
              size="icon"
              onClick={onTogglePiP}
              iconName="PictureInPicture"
              iconSize={18}
              className="glassmorphic"
            />
          )}

          {/* Fullscreen */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleFullscreen}
            iconName={isFullscreen ? "Minimize" : "Maximize"}
            iconSize={18}
            className="glassmorphic"
          />
        </div>
      </div>

      {/* PiP Close Button */}
      {isPictureInPicture && (
        <Button
          variant="destructive"
          size="icon"
          onClick={onTogglePiP}
          iconName="X"
          iconSize={14}
          className="absolute top-2 right-2 w-6 h-6"
        />
      )}

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-8 left-8 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute bottom-12 right-12 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};

export default VideoFeed;
