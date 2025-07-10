import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from 'components/layout/MainLayout';
import InterviewNavigation from 'components/ui/InterviewNavigation';
import VideoFeed from './components/VideoFeed';
import ChatPanel from './components/ChatPanel';
import WhiteboardPanel from './components/WhiteboardPanel';
import CodeEditorPanel from './components/CodeEditorPanel';
import ScreenSharePanel from './components/ScreenSharePanel';
import InterviewControls from './components/InterviewControls';
import FeedbackModal from './components/FeedbackModal';
import Icon from 'components/AppIcon';


const VideoInterviewInterface = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  // Mock participants data
  const participants = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Senior Technical Interviewer',
      email: 'sarah.johnson@techcorp.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Alex Chen',
      role: 'Software Engineer Candidate',
      email: 'alex.chen@email.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const currentUser = participants[1]; // Candidate perspective

  const toolTabs = [
    { id: 'chat', name: 'Chat', icon: 'MessageCircle', component: ChatPanel },
    { id: 'whiteboard', name: 'Whiteboard', icon: 'PenTool', component: WhiteboardPanel },
    { id: 'code', name: 'Code Editor', icon: 'Code', component: CodeEditorPanel },
    { id: 'screen', name: 'Screen Share', icon: 'Share', component: ScreenSharePanel }
  ];

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/authentication-login-register');
      return;
    }

    // Session timer
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    // Cleanup on unmount
    return () => {
      clearInterval(timer);
    };
  }, [navigate]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setActiveTab('chat');
            break;
          case '2':
            e.preventDefault();
            setActiveTab('whiteboard');
            break;
          case '3':
            e.preventDefault();
            setActiveTab('code');
            break;
          case '4':
            e.preventDefault();
            setActiveTab('screen');
            break;
          case 'r':
            e.preventDefault();
            handleToggleRecording();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleEndInterview = () => {
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = (feedbackData) => {
    console.log('Feedback submitted:', feedbackData);
    // In a real app, this would send feedback to the backend
    navigate('/homepage');
  };

  const handleTogglePiP = () => {
    setIsPictureInPicture(!isPictureInPicture);
  };

  const ActiveTabComponent = toolTabs.find(tab => tab.id === activeTab)?.component;

  return (
    <MainLayout
      title="Video Interview"
      description="Participate in a virtual interview session"
      noPadding
      fullWidth
      hideFooter
    >
      

      <div className="min-h-screen bg-background">
        {/* Interview Navigation */}
        <InterviewNavigation />

        {/* Main Interview Layout */}
        <div className="pt-16 pb-16 h-screen flex">
          {/* Video Section */}
          <div className="flex-1 p-4 space-y-4">
            {/* Primary Video Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(50vh-2rem)]">
              {participants.map((participant) => (
                <VideoFeed
                  key={participant.id}
                  participant={participant}
                  isLocal={participant.id === currentUser.id}
                  isPictureInPicture={false}
                  onTogglePiP={handleTogglePiP}
                  isRecording={isRecording}
                />
              ))}
            </div>

            {/* Interview Status */}
            <div className="glassmorphic rounded-squircle p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                    <span className="text-sm font-body font-body-medium text-foreground">
                      Interview in Progress
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Users" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {participants.length} participants
                    </span>
                  </div>
                  {isRecording && (
                    <div className="flex items-center space-x-2 bg-error/10 text-error px-3 py-1 rounded-squircle">
                      <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
                      <span className="text-xs font-body font-body-medium">
                        Recording
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Position:</span>
                  <span className="text-sm font-body font-body-medium text-foreground">
                    Senior Software Engineer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tools Panel */}
          <div className="w-96 p-4 border-l border-border">
            {/* Tab Navigation */}
            <div className="glassmorphic rounded-t-squircle p-1 mb-0">
              <div className="grid grid-cols-2 gap-1">
                {toolTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-squircle spring-transition ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground glow-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} />
                    <span className="text-sm font-body font-body-medium">
                      {tab.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="h-[calc(100vh-12rem)] rounded-b-squircle overflow-hidden">
              {ActiveTabComponent && (
                <ActiveTabComponent
                  participants={participants}
                  currentUser={currentUser}
                />
              )}
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="mt-4 glassmorphic rounded-squircle p-3">
              <h4 className="text-xs font-body font-body-medium text-foreground mb-2">
                Keyboard Shortcuts
              </h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Switch to Chat</span>
                  <span className="font-data">Ctrl+1</span>
                </div>
                <div className="flex justify-between">
                  <span>Switch to Whiteboard</span>
                  <span className="font-data">Ctrl+2</span>
                </div>
                <div className="flex justify-between">
                  <span>Switch to Code</span>
                  <span className="font-data">Ctrl+3</span>
                </div>
                <div className="flex justify-between">
                  <span>Toggle Recording</span>
                  <span className="font-data">Ctrl+R</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Picture-in-Picture Video */}
        {isPictureInPicture && (
          <VideoFeed
            participant={participants[0]}
            isPictureInPicture={true}
            onTogglePiP={handleTogglePiP}
            isRecording={isRecording}
          />
        )}

        {/* Interview Controls */}
        <InterviewControls
          onEndInterview={handleEndInterview}
          isRecording={isRecording}
          onToggleRecording={handleToggleRecording}
          sessionTime={sessionTime}
          participants={participants}
        />

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleFeedbackSubmit}
          interviewData={{
            duration: sessionTime,
            participantName: participants.find(p => p.id !== currentUser.id)?.name
          }}
        />

        {/* Ambient Particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-particles">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/10 rounded-full particle-float"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent/20 rounded-full particle-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-secondary/15 rounded-full particle-float" style={{ animationDelay: '4s' }}></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-success/20 rounded-full particle-float" style={{ animationDelay: '6s' }}></div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VideoInterviewInterface;
