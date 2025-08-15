import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const AICareerCoachChat = ({ isOpen, onClose, courseContext }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `Hi! I'm your AI Career Coach. I see you're working on "${courseContext?.title}". How can I help you with your learning journey today?`,
      timestamp: new Date(Date.now() - 60000)
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions] = useState([
    "How does this course help my career?",
    "What jobs can I get after this?",
    "Suggest similar courses",
    "Review my progress"
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(message);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage) => {
    const responses = {
      career: `Based on your progress in "${courseContext?.title}", you're developing valuable skills in React development. This course positions you well for roles like Frontend Developer, React Developer, or Full-Stack Developer. The average salary for these positions in India ranges from ₹12,00,000 to ₹22,00,000 depending on experience and location.`,

      jobs: `After completing this course, you'll be qualified for several exciting positions:\n\n• Frontend Developer at tech companies\n• React Developer (remote opportunities available)\n• UI/UX Developer roles\n• Full-Stack Developer positions\n• Freelance React consultant\n\nWould you like me to help you prepare for interviews for any of these roles?`,

      progress: `You're making excellent progress! You've completed ${courseContext?.progress || 65}% of the course. Your strongest areas are component architecture and state management. I recommend focusing more on performance optimization in the upcoming modules.\n\nKeep up the great work! You're on track to complete this course within the next 2 weeks.`,

      similar: `Based on your interest in "${courseContext?.title}", I recommend these courses:\n\n• Advanced React Patterns\n• Node.js Backend Development\n• TypeScript Fundamentals\n• React Native Mobile Development\n• GraphQL with React\n\nWould you like detailed information about any of these?`,

      default: `That's a great question! As your AI Career Coach, I'm here to help you succeed. Based on your current course progress and career goals, I can provide personalized advice on:\n\n• Career path recommendations\n• Skill development strategies\n• Interview preparation\n• Portfolio building tips\n• Industry insights\n\nWhat specific area would you like to explore?`
    };

    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('salary')) {
      return responses.career;
    } else if (lowerMessage.includes('jobs') || lowerMessage.includes('position') || lowerMessage.includes('role')) {
      return responses.jobs;
    } else if (lowerMessage.includes('progress') || lowerMessage.includes('how am i doing')) {
      return responses.progress;
    } else if (lowerMessage.includes('similar') || lowerMessage.includes('recommend') || lowerMessage.includes('course')) {
      return responses.similar;
    } else {
      return responses.default;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Mobile Overlay */}
      <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      {/* Chat Panel */}
      <div className="fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto lg:left-auto lg:right-auto h-2/3 lg:h-96 glassmorphic border-t lg:border border-white/20 lg:rounded-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Icon name="Bot" size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI Career Coach</h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-xs text-success">Online</span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <Icon name="X" size={18} />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`p-3 rounded-lg ${message.type === 'user' ? 'bg-primary text-white ml-auto' : 'bg-white/10 text-foreground'
                  }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {message.content}
                  </p>
                </div>
                <div className={`text-xs text-muted-foreground mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'
                  }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>

              {message.type === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mr-2 order-0">
                  <Icon name="Bot" size={12} className="text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mr-2">
                <Icon name="Bot" size={12} className="text-white" />
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 py-2 border-t border-white/10">
            <div className="text-xs text-muted-foreground mb-2">Quick questions:</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(suggestion)}
                  className="text-xs bg-white/10 hover:bg-white/20 text-foreground px-3 py-1 rounded-full transition-colors duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Ask me anything about your career..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              size="icon"
            >
              <Icon name="Send" size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICareerCoachChat;
