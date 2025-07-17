import React, { useState, useRef } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const WebinarPlayer = ({ webinar, onClose }) => {
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      user: 'Sarah Johnson',
      message: 'Great presentation! Can you share more about the remote work policy?',
      timestamp: '2:34 PM',
      isHost: false
    },
    {
      id: 2,
      user: 'Tech Recruiter',
      message: 'Thanks Sarah! We offer flexible remote work options. I\'ll cover this in detail shortly.',
      timestamp: '2:35 PM',
      isHost: true
    },
    {
      id: 3,
      user: 'Mike Chen',
      message: 'What technologies does the team primarily work with?',
      timestamp: '2:36 PM',
      isHost: false
    }
  ]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        user: 'You',
        message: chatMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHost: false
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
    }
  };

  const handleRaiseHand = () => {
    setIsHandRaised(!isHandRaised);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-full max-h-[90vh] bg-card rounded-xl shadow-elevation-4 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{webinar.title}</h2>
            <p className="text-sm text-muted-foreground">{webinar.company} • {webinar.presenter}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Icon name="Users" size={16} />
              <span>{webinar.viewers} viewers</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Video Player */}
          <div className="flex-1 bg-black relative">
            <div
              ref={videoRef}
              className="w-full h-full flex items-center justify-center"
            >
              {/* Mock Video Player */}
              <div className="relative w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <Icon name="Play" size={64} className="text-white/80 mx-auto mb-4" />
                  <p className="text-white/80 text-lg">Live Presentation</p>
                  <p className="text-white/60 text-sm">{webinar.presenter} is presenting</p>
                </div>
                
                {/* Video Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      <Icon name="Volume2" size={20} />
                    </Button>
                    <div className="text-white text-sm">
                      {webinar.duration} / {webinar.totalDuration}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={isHandRaised ? "default" : "ghost"}
                      size="sm"
                      onClick={handleRaiseHand}
                      className={isHandRaised ? "bg-warning text-warning-foreground" : "text-white hover:bg-white/20"}
                      iconName="Hand"
                      iconPosition="left"
                    >
                      {isHandRaised ? 'Hand Raised' : 'Raise Hand'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      <Icon name={isFullscreen ? "Minimize" : "Maximize"} size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="w-80 border-l border-border flex flex-col">
            {/* Chat Header */}
            <div className="p-3 border-b border-border">
              <h3 className="font-medium text-foreground">Live Chat</h3>
              <p className="text-xs text-muted-foreground">{chatMessages.length} messages</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((message) => (
                <div key={message.id} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${
                      message.isHost ? 'text-primary' : 'text-foreground'
                    }`}>
                      {message.user}
                    </span>
                    {message.isHost && (
                      <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs">
                        Host
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                  <p className="text-sm text-foreground">{message.message}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-border">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  variant="default"
                  size="icon"
                  disabled={!chatMessage.trim()}
                >
                  <Icon name="Send" size={16} />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebinarPlayer;
