import React, { useState, useEffect, useRef } from 'react';
import MainLayout from 'components/layout/MainLayout';
import SidebarLayout from 'components/layout/SidebarLayout';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import PromptSuggestions from './components/PromptSuggestions';
import ChatHistory from './components/ChatHistory';
import MessageFeedback from './components/MessageFeedback';
import ConversationExport from './components/ConversationExport';
import SmartNotifications from './components/SmartNotifications';

const AICareerCoachChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState('current');
  const [showPrompts, setShowPrompts] = useState(true);
  const messagesEndRef = useRef(null);

  // Mock conversations data
  const [conversations] = useState([
    {
      id: 'conv1',
      title: 'Resume Review Session',
      category: 'resume',
      lastMessage: 'Your resume looks great! Consider adding more quantifiable achievements.',
      lastActivity: new Date(Date.now() - 86400000), // 1 day ago
      messageCount: 15,
      hasUnread: false,
      messages: []
    },
    {
      id: 'conv2',
      title: 'Frontend Developer Career Path',
      category: 'career',
      lastMessage: 'Based on your skills, I recommend focusing on React and TypeScript.',
      lastActivity: new Date(Date.now() - 172800000), // 2 days ago
      messageCount: 23,
      hasUnread: true,
      messages: []
    },
    {
      id: 'conv3',
      title: 'Interview Preparation',
      category: 'interview',
      lastMessage: 'Let\'s practice some common behavioral interview questions.',
      lastActivity: new Date(Date.now() - 259200000), // 3 days ago
      messageCount: 8,
      hasUnread: false,
      messages: []
    }
  ]);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      type: 'text',
      content: `Hello! I'm your AI Career Coach. I'm here to help you with:\n\n• Resume and profile optimization\n• Job search strategies\n• Skill development planning\n• Interview preparation\n• Career path guidance\n\nWhat would you like to work on today?`,
      timestamp: new Date(),
      isUser: false
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (messageText) => {
    const userMessage = {
      id: Date.now(),
      type: 'text',
      content: messageText,
      timestamp: new Date(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setShowPrompts(false);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
      return {
        id: Date.now() + 1,
        type: 'text',
        content: `I'd be happy to help you with your resume! Here are some key areas to focus on:\n\n• **Professional Summary**: Write a compelling 2-3 line summary highlighting your key strengths\n• **Quantifiable Achievements**: Use numbers and metrics to demonstrate your impact\n• **Relevant Keywords**: Include industry-specific terms that ATS systems look for\n• **Clean Formatting**: Ensure consistent formatting and easy readability\n\nWould you like me to review a specific section of your resume, or do you have questions about any of these areas?`,
        timestamp: new Date(),
        isUser: false
      };
    }
    
    if (lowerMessage.includes('job') || lowerMessage.includes('position')) {
      return {
        id: Date.now() + 1,
        type: 'job_recommendation',
        content: `Based on your profile, I found some relevant opportunities for you:`,
        jobTitle: 'Senior Frontend Developer',
        company: 'TechCorp Solutions',
        salary: '$85,000 - $110,000',
        timestamp: new Date(),
        isUser: false
      };
    }
    
    if (lowerMessage.includes('skill') || lowerMessage.includes('learn')) {
      return {
        id: Date.now() + 1,
        type: 'skill_assessment',
        content: `Here's an assessment of your current skills and recommendations for improvement:`,
        skills: [
          { name: 'React', level: 85 },
          { name: 'JavaScript', level: 90 },
          { name: 'TypeScript', level: 70 },
          { name: 'Node.js', level: 65 }
        ],
        timestamp: new Date(),
        isUser: false
      };
    }
    
    if (lowerMessage.includes('course') || lowerMessage.includes('training')) {
      return {
        id: Date.now() + 1,
        type: 'course_suggestion',
        content: `I recommend this course to enhance your skills:`,
        courseTitle: 'Advanced React Patterns',
        courseDescription: 'Master advanced React concepts including hooks, context, and performance optimization',
        duration: '6 weeks',
        timestamp: new Date(),
        isUser: false
      };
    }
    
    if (lowerMessage.includes('interview')) {
      return {
        id: Date.now() + 1,
        type: 'text',
        content: `Great! Let's prepare for your interviews. Here's a structured approach:\n\n**Technical Preparation:**\n• Review fundamental concepts in your tech stack\n• Practice coding problems on platforms like LeetCode\n• Prepare to explain your past projects in detail\n\n**Behavioral Questions:**\n• Use the STAR method (Situation, Task, Action, Result)\n• Prepare examples of challenges you've overcome\n• Think about times you've shown leadership or teamwork\n\n**Questions to Ask:**\n• "What does success look like in this role?"\n• "What are the biggest challenges facing the team?"\n• "How do you support professional development?"\n\nWould you like to practice answering specific questions?`,
        timestamp: new Date(),
        isUser: false
      };
    }
    
    // Default response
    return {
      id: Date.now() + 1,
      type: 'text',
      content: `I understand you're asking about "${userMessage}". I'm here to help with all aspects of your career development.\n\nI can assist you with:\n• Resume and LinkedIn optimization\n• Job search strategies and applications\n• Skill development and learning paths\n• Interview preparation and practice\n• Career planning and goal setting\n• Salary negotiation tips\n• Professional networking advice\n\nWhat specific area would you like to focus on?`,
      timestamp: new Date(),
      isUser: false
    };
  };

  const handlePromptSelect = (prompt) => {
    handleSendMessage(prompt);
  };

  const handleVoiceRecord = (isRecording) => {
    console.log('Voice recording:', isRecording);
    // Voice recording logic would go here
  };

  const handleFeedbackSubmit = async (messageId, feedback) => {
    console.log('Feedback submitted:', messageId, feedback);
    // Feedback submission logic would go here
  };

  const handleConversationSelect = (conversationId) => {
    setCurrentConversationId(conversationId);
    setShowHistory(false);
    // Load conversation messages
    console.log('Loading conversation:', conversationId);
  };

  const handleExport = async (exportData) => {
    console.log('Exporting conversation:', exportData);
    // Export logic would go here
  };

  const currentConversation = {
    id: currentConversationId,
    title: 'Current Session',
    messages: messages
  };

  return (
    <MainLayout
      title="AI Career Coach"
      description="Get personalized career guidance with AI-powered coaching. Resume reviews, job search strategies, and skill development recommendations."
      noPadding
      fullWidth
    >
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <SidebarLayout
          sidebar={
            <ChatHistory
              conversations={conversations}
              onSelectConversation={handleConversationSelect}
              currentConversationId={currentConversationId}
              className="h-full"
            />
          }
          sidebarWidth={320}
          collapsible
        >

          {/* Main Chat Interface */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="glassmorphic-card p-4 border-b border-white/20 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(!showHistory)}
                  className="lg:hidden hover:bg-white/10"
                >
                  <Icon name="Menu" size={18} />
                </Button>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Icon name="Bot" size={16} color="white" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-foreground">AI Career Coach</h1>
                    <p className="text-sm text-muted-foreground">
                      {isTyping ? 'Typing...' : 'Online'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <SmartNotifications />
                <ConversationExport
                  conversation={currentConversation}
                  onExport={handleExport}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-white/10"
                >
                  <Icon name="MoreVertical" size={18} />
                </Button>
              </div>
            </div>

            {/* Prompt Suggestions */}
            {showPrompts && messages.length <= 1 && (
              <PromptSuggestions
                onSelectPrompt={handlePromptSelect}
                visible={showPrompts}
              />
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <ChatMessage
                    message={message}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                  {!message.isUser && (
                    <MessageFeedback
                      messageId={message.id}
                      onFeedbackSubmit={handleFeedbackSubmit}
                      className="ml-11"
                    />
                  )}
                </div>
              ))}
              
              {isTyping && (
                <ChatMessage
                  message={{}}
                  isUser={false}
                  timestamp={new Date()}
                  isTyping={true}
                />
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              onVoiceRecord={handleVoiceRecord}
              disabled={isTyping}
            />
          </div>

          {/* Mobile Chat History Overlay */}
          {showHistory && (
            <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40">
              <div className="w-80 h-full glassmorphic border-r border-white/20">
                <ChatHistory
                  conversations={conversations}
                  onSelectConversation={handleConversationSelect}
                  currentConversationId={currentConversationId}
                  className="h-full"
                />
              </div>
            </div>
          )}
        </SidebarLayout>
      </div>
    </MainLayout>
  );
};

export default AICareerCoachChatInterface;
