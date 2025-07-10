import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const VideoStream = ({ 
  stream, 
  isLocal = false, 
  isMuted = false, 
  isVideoOff = false, 
  participantName = "Participant",
  onToggleMute,
  onToggleVideo,
  className = ""
}) => {
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

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

  return (
    <div className={`relative bg-slate-900 rounded-xl overflow-hidden shadow-elevation-3 ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || isMuted}
        className="w-full h-full object-cover"
        style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }}
      />
      
      {/* Video Off Overlay */}
      {isVideoOff && (
        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Icon name="User" size={32} className="text-slate-400" />
            </div>
            <p className="text-white font-medium">{participantName}</p>
            <p className="text-slate-400 text-sm">Camera is off</p>
          </div>
        </div>
      )}

      {/* Participant Name Badge */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg">
        <p className="text-white text-sm font-medium flex items-center space-x-2">
          <span>{participantName}</span>
          {isMuted && <Icon name="MicOff" size={14} className="text-red-400" />}
        </p>
      </div>

      {/* Video Controls Overlay */}
      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFullscreen}
          className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
        >
          <Icon name={isFullscreen ? "Minimize2" : "Maximize2"} size={16} />
        </Button>
      </div>

      {/* Local Video Controls */}
      {isLocal && (
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMute}
            className={`backdrop-blur-sm ${
              isMuted 
                ? 'bg-red-500/80 text-white hover:bg-red-600/80' :'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            <Icon name={isMuted ? "MicOff" : "Mic"} size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleVideo}
            className={`backdrop-blur-sm ${
              isVideoOff 
                ? 'bg-red-500/80 text-white hover:bg-red-600/80' :'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            <Icon name={isVideoOff ? "VideoOff" : "Video"} size={16} />
          </Button>
        </div>
      )}

      {/* Connection Quality Indicator */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default VideoStream;
