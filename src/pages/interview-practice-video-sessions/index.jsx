import React, { useState, useEffect } from 'react';
import MainLayout from 'components/layout/MainLayout'
import SidebarLayout from 'components/layout/SidebarLayout';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import VideoStream from './components/VideoStream';
import SessionControls from './components/SessionControls';
import QuestionBank from './components/QuestionBank';
import ChatSidebar from './components/ChatSidebar';
import SessionFeedback from './components/SessionFeedback';
import PracticeMode from './components/PracticeMode';

const InterviewPracticeVideoSessions = () => {
  const [sessionState, setSessionState] = useState('setup'); // setup, practice, live, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [connectionQuality, setConnectionQuality] = useState('good');

  // Mock streams for demonstration
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    let interval;
    if (sessionState === 'live' || sessionState === 'practice') {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionState]);

  // Mock connection quality check
  useEffect(() => {
    const checkConnection = () => {
      const qualities = ['excellent', 'good', 'fair', 'poor'];
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      setConnectionQuality(randomQuality);
    };

    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStartSession = (type = 'live') => {
    setSessionState(type);
    setSessionDuration(0);
    // Initialize mock streams
    setLocalStream(new MediaStream());
    if (type === 'live') {
      setRemoteStream(new MediaStream());
    }
  };

  const handleEndSession = () => {
    setSessionState('ended');
    setIsFeedbackOpen(true);
    setLocalStream(null);
    setRemoteStream(null);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
    setUnreadMessages(0);
  };

  const handleSendMessage = (message) => {
    console.log('Sending message:', message);
    // Mock message handling
  };

  const handleSelectQuestion = (question) => {
    setCurrentQuestion(question);
    setIsQuestionBankOpen(false);
    // Mock question insertion into chat or display
    console.log('Selected question:', question);
  };

  const handleSubmitFeedback = async (feedbackData) => {
    console.log('Submitting feedback:', feedbackData);
    // Mock feedback submission
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const getConnectionQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-green-400';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const upcomingSessions = [
    {
      id: 1,
      title: 'Technical Interview Practice',
      interviewer: 'Sarah Chen',
      interviewerRole: 'Senior Software Engineer at Google',
      time: '2:00 PM - 3:00 PM',
      date: 'Today',
      type: 'Technical',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c3c8e4?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      title: 'Behavioral Interview Session',
      interviewer: 'Michael Rodriguez',
      interviewerRole: 'Engineering Manager at Microsoft',
      time: '4:30 PM - 5:30 PM',
      date: 'Today',
      type: 'Behavioral',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      title: 'System Design Deep Dive',
      interviewer: 'Emily Zhang',
      interviewerRole: 'Principal Architect at Amazon',
      time: '10:00 AM - 11:30 AM',
      date: 'Tomorrow',
      type: 'System Design',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const recentSessions = [
    {
      id: 1,
      title: 'Frontend Development Interview',
      interviewer: 'Alex Thompson',
      date: 'Yesterday',
      duration: '45 min',
      rating: 4,
      feedback: 'Great technical knowledge, work on communication clarity.',
      type: 'Technical'
    },
    {
      id: 2,
      title: 'Leadership & Management',
      interviewer: 'Jessica Liu',
      date: '2 days ago',
      duration: '60 min',
      rating: 5,
      feedback: 'Excellent leadership examples and clear communication.',
      type: 'Behavioral'
    },
    {
      id: 3,
      title: 'Database Design Challenge',
      interviewer: 'David Kumar',
      date: '1 week ago',
      duration: '90 min',
      rating: 3,
      feedback: 'Good approach, but consider scalability factors more deeply.',
      type: 'System Design'
    }
  ];

  if (sessionState === 'setup') {
    return (
      <MainLayout
        title="Interview Practice & Video Sessions" 
        description="Master your interview skills with AI-powered practice sessions and live mentorship from industry experts"
        fullWidth
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Interview Practice & Video Sessions
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Master your interview skills with AI-powered practice sessions and live mentorship from industry experts
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="glassmorphic rounded-xl p-6 border border-white/20 hover:border-primary/30 transition-spring">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Brain" size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">AI Practice Mode</h3>
                <p className="text-muted-foreground mb-4">
                  Practice with AI-generated questions and get instant feedback on your responses.
                </p>
                <Button onClick={() => setIsPracticeMode(true)} className="w-full">
                  Start AI Practice
                </Button>
              </div>

              <div className="glassmorphic rounded-xl p-6 border border-white/20 hover:border-primary/30 transition-spring">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Users" size={24} className="text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Live Sessions</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with experienced interviewers for real-time practice and feedback.
                </p>
                <Button onClick={() => handleStartSession('live')} variant="outline" className="w-full">
                  Join Live Session
                </Button>
              </div>

              <div className="glassmorphic rounded-xl p-6 border border-white/20 hover:border-primary/30 transition-spring">
                <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Calendar" size={24} className="text-warning" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Schedule Session</h3>
                <p className="text-muted-foreground mb-4">
                  Book a personalized interview session with industry mentors.
                </p>
                <Button variant="secondary" className="w-full">
                  Schedule Now
                </Button>
              </div>
            </div>

            {/* Connection Quality Check */}
            <div className="glassmorphic rounded-xl p-6 border border-white/20 mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Icon name="Wifi" size={20} className="mr-2" />
                Technical Requirements Check
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Icon name="Check" size={16} className="text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Camera Access</p>
                    <p className="text-sm text-muted-foreground">Enabled</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Icon name="Check" size={16} className="text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Microphone Access</p>
                    <p className="text-sm text-muted-foreground">Enabled</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    connectionQuality === 'excellent' || connectionQuality === 'good' ?'bg-green-500/20' 
                      : connectionQuality === 'fair' ?'bg-yellow-500/20' :'bg-red-500/20'
                  }`}>
                    <Icon name="Wifi" size={16} className={getConnectionQualityColor()} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Connection Quality</p>
                    <p className={`text-sm capitalize ${getConnectionQualityColor()}`}>
                      {connectionQuality}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Sessions */}
              <div className="glassmorphic rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                  <Icon name="Calendar" size={20} className="mr-2 text-primary" />
                  Upcoming Sessions
                </h3>
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="glassmorphic rounded-lg p-4 border border-white/10">
                      <div className="flex items-start space-x-4">
                        <img
                          src={session.avatar}
                          alt={session.interviewer}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-foreground">{session.title}</h4>
                              <p className="text-sm text-muted-foreground">{session.interviewer}</p>
                              <p className="text-xs text-muted-foreground">{session.interviewerRole}</p>
                            </div>
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                              {session.type}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Icon name="Calendar" size={14} className="mr-1" />
                                {session.date}
                              </span>
                              <span className="flex items-center">
                                <Icon name="Clock" size={14} className="mr-1" />
                                {session.time}
                              </span>
                            </div>
                            <Button size="sm" onClick={() => handleStartSession('live')}>
                              Join
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="glassmorphic rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                  <Icon name="History" size={20} className="mr-2 text-accent" />
                  Recent Sessions
                </h3>
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="glassmorphic rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-foreground">{session.title}</h4>
                          <p className="text-sm text-muted-foreground">with {session.interviewer}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Icon
                              key={i}
                              name="Star"
                              size={14}
                              className={i < session.rating ? 'text-yellow-400' : 'text-muted-foreground'}
                              fill={i < session.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <span>{session.date}</span>
                        <span>{session.duration}</span>
                        <span className="px-2 py-1 bg-muted rounded text-xs">{session.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{session.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        {/* Practice Mode Modal */}
        <PracticeMode
          isActive={isPracticeMode}
          onStartSession={handleStartSession}
          onClose={() => setIsPracticeMode(false)}
        />
      </MainLayout>
    );
  }

  if (sessionState === 'live' || sessionState === 'practice') {
    return (
      <MainLayout
        title={`${sessionState === 'practice' ? 'Practice' : 'Live'} Interview Session`}
        noPadding
        hideFooter
      >
        {/* Video Layout */}
        <div className="flex h-screen">
          {/* Main Video Area */}
          <div className="flex-1 relative">
            {sessionState === 'live' && remoteStream ? (
              <VideoStream
                stream={remoteStream}
                participantName="Sarah Chen"
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <Icon name="User" size={64} className="text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">
                    {sessionState === 'practice' ? 'AI Practice Mode' : 'Waiting for interviewer...'}
                  </h3>
                  <p className="text-slate-400">
                    {sessionState === 'practice' ?'Practice your responses with AI guidance' :'The session will begin shortly'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Picture-in-Picture Local Video */}
            <div className="absolute bottom-20 right-4 w-64 h-48 lg:w-80 lg:h-60">
              <VideoStream
                stream={localStream}
                isLocal={true}
                isMuted={isMuted}
                isVideoOff={isVideoOff}
                participantName="You"
                onToggleMute={handleToggleMute}
                onToggleVideo={handleToggleVideo}
                className="w-full h-full"
              />
            </div>

            {/* Question Display */}
            {currentQuestion && (
              <div className="absolute top-4 left-4 right-4 glassmorphic rounded-lg p-4 border border-white/20 max-w-2xl">
                <h3 className="font-medium text-white mb-2">Current Question:</h3>
                <p className="text-slate-200">{currentQuestion.question}</p>
                {currentQuestion.followUp && (
                  <p className="text-slate-300 text-sm mt-2">
                    <span className="font-medium">Follow-up:</span> {currentQuestion.followUp}
                  </p>
                )}
              </div>
            )}

            {/* Session Controls */}
            <SessionControls
              isMuted={isMuted}
              isVideoOff={isVideoOff}
              isRecording={isRecording}
              isScreenSharing={isScreenSharing}
              sessionDuration={sessionDuration}
              onToggleMute={handleToggleMute}
              onToggleVideo={handleToggleVideo}
              onToggleRecording={handleToggleRecording}
              onToggleScreenShare={handleToggleScreenShare}
              onEndSession={handleEndSession}
              onOpenChat={handleOpenChat}
              unreadMessages={unreadMessages}
            />
          </div>

          {/* Chat Sidebar */}
          <ChatSidebar
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Question Bank Modal */}
        <QuestionBank
          isVisible={isQuestionBankOpen}
          onClose={() => setIsQuestionBankOpen(false)}
          onSelectQuestion={handleSelectQuestion}
        />

        {/* Feedback Modal */}
        <SessionFeedback
          isVisible={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          onSubmit={handleSubmitFeedback}
          sessionData={{ id: 'session-123' }}
        />

        {/* Floating Action Button for Question Bank */}
        {sessionState === 'live' && (
          <Button
            onClick={() => setIsQuestionBankOpen(true)}
            className="fixed top-20 left-4 z-30"
            size="sm"
          >
            <Icon name="HelpCircle" size={16} className="mr-2" />
            Questions
          </Button>
        )}
      </MainLayout>
    );
  }

  return null;
};

export default InterviewPracticeVideoSessions;

