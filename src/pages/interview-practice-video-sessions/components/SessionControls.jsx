import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const SessionControls = ({
  isMuted,
  isVideoOff,
  isRecording,
  isScreenSharing,
  sessionDuration,
  onToggleMute,
  onToggleVideo,
  onToggleRecording,
  onToggleScreenShare,
  onEndSession,
  onOpenChat,
  unreadMessages = 0
}) => {
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    setShowEndConfirm(true);
  };

  const confirmEndSession = () => {
    onEndSession();
    setShowEndConfirm(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 glassmorphic border-t border-white/20 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Session Timer */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-foreground font-mono text-sm">
                {formatDuration(sessionDuration)}
              </span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-4">
            {/* Mute Toggle */}
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={onToggleMute}
              className="min-w-[60px] h-12"
            >
              <Icon name={isMuted ? "MicOff" : "Mic"} size={20} />
            </Button>

            {/* Video Toggle */}
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="lg"
              onClick={onToggleVideo}
              className="min-w-[60px] h-12"
            >
              <Icon name={isVideoOff ? "VideoOff" : "Video"} size={20} />
            </Button>

            {/* Screen Share */}
            <Button
              variant={isScreenSharing ? "default" : "secondary"}
              size="lg"
              onClick={onToggleScreenShare}
              className="min-w-[60px] h-12"
            >
              <Icon name="Monitor" size={20} />
            </Button>

            {/* Recording */}
            <Button
              variant={isRecording ? "destructive" : "secondary"}
              size="lg"
              onClick={onToggleRecording}
              className="min-w-[60px] h-12"
            >
              <Icon name={isRecording ? "Square" : "Circle"} size={20} />
            </Button>

            {/* Chat */}
            <Button
              variant="secondary"
              size="lg"
              onClick={onOpenChat}
              className="min-w-[60px] h-12 relative"
            >
              <Icon name="MessageCircle" size={20} />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </Button>

            {/* End Session */}
            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndSession}
              className="min-w-[100px] h-12"
            >
              <Icon name="PhoneOff" size={20} className="mr-2" />
              End
            </Button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Icon name="Settings" size={16} className="mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Icon name="Volume2" size={16} className="mr-2" />
              Audio
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Icon name="Wifi" size={16} className="mr-2" />
              Connection
            </Button>
          </div>
        </div>
      </div>

      {/* End Session Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glassmorphic rounded-xl p-6 max-w-md w-full mx-4 border border-white/20">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="PhoneOff" size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                End Session?
              </h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to end this interview session? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmEndSession}
                  className="flex-1"
                >
                  End Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionControls;
