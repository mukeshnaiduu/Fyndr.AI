import React, { useState, useEffect, useRef } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const ChatPanel = ({ participants, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Mock initial messages
    const initialMessages = [
      {
        id: 1,
        sender: participants[0],
        content: "Hello! I\'m excited to start our interview today.",
        timestamp: new Date(Date.now() - 300000),
        type: 'text'
      },
      {
        id: 2,
        sender: participants[1],
        content: "Thank you! I\'m looking forward to discussing the role.",
        timestamp: new Date(Date.now() - 240000),
        type: 'text'
      },
      {
        id: 3,
        sender: participants[0],
        content: "Let\'s start with a quick introduction. Can you tell me about yourself?",
        timestamp: new Date(Date.now() - 180000),
        type: 'text'
      }
    ];

    setMessages(initialMessages);
  }, [participants]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simulate typing indicators
    if (newMessage.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [newMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: currentUser,
        content: newMessage.trim(),
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate response after 2 seconds
      setTimeout(() => {
        const otherParticipant = participants.find(p => p.id !== currentUser.id);
        if (otherParticipant) {
          const responses = [
            "That\'s a great point!",
            "I understand. Let me think about that.",
            "Could you elaborate on that?",
            "Interesting perspective.",
            "I agree with your approach."
          ];
          
          const response = {
            id: Date.now() + 1,
            sender: otherParticipant,
            content: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date(),
            type: 'text'
          };
          
          setMessages(prev => [...prev, response]);
        }
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isCurrentUser = (sender) => {
    return sender.id === currentUser.id;
  };

  const sendQuickMessage = (message) => {
    const quickMessage = {
      id: Date.now(),
      sender: currentUser,
      content: message,
      timestamp: new Date(),
      type: 'quick'
    };

    setMessages(prev => [...prev, quickMessage]);
  };

  const quickMessages = [
    "👍 Sounds good",
    "❓ Can you repeat that?",
    "⏰ Need a moment",
    "✅ Got it"
  ];

  return (
    <div className="h-full flex flex-col glassmorphic rounded-squircle">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="MessageCircle" size={20} className="text-primary" />
          <h3 className="font-heading font-heading-semibold text-foreground">
            Chat
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground font-data">
            {participants.length} participants
          </span>
          <Button
            variant="ghost"
            size="icon"
            iconName="MoreVertical"
            iconSize={16}
          />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${isCurrentUser(message.sender) ? 'justify-end' : 'justify-start'} stagger-${(index % 3) + 1}`}
          >
            <div className={`max-w-xs lg:max-w-sm ${isCurrentUser(message.sender) ? 'order-2' : 'order-1'}`}>
              {/* Message Bubble */}
              <div
                className={`px-4 py-2 rounded-squircle ${
                  isCurrentUser(message.sender)
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-muted text-foreground mr-4'
                } ${message.type === 'quick' ? 'bg-accent text-accent-foreground' : ''}`}
              >
                <p className="text-sm font-body break-words">
                  {message.content}
                </p>
              </div>

              {/* Message Info */}
              <div className={`flex items-center space-x-2 mt-1 px-2 ${
                isCurrentUser(message.sender) ? 'justify-end' : 'justify-start'
              }`}>
                <span className="text-xs text-muted-foreground font-data">
                  {formatTime(message.timestamp)}
                </span>
                {!isCurrentUser(message.sender) && (
                  <span className="text-xs text-muted-foreground font-caption">
                    {message.sender.name}
                  </span>
                )}
              </div>
            </div>

            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex-shrink-0 ${
              isCurrentUser(message.sender) ? 'order-1 mr-2' : 'order-2 ml-2'
            }`}>
              <div className="w-full h-full bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-xs font-heading font-heading-bold text-white">
                  {message.sender.name.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-muted px-4 py-2 rounded-squircle">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs text-muted-foreground">typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Messages */}
      <div className="px-4 py-2 border-t border-border">
        <div className="flex flex-wrap gap-2">
          {quickMessages.map((message, index) => (
            <button
              key={index}
              onClick={() => sendQuickMessage(message)}
              className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full hover:bg-secondary/80 spring-transition"
            >
              {message}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-1">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="resize-none"
            />
          </div>
          <Button
            type="submit"
            variant="default"
            size="icon"
            disabled={!newMessage.trim()}
            iconName="Send"
            iconSize={16}
            className="flex-shrink-0"
          />
        </form>
      </div>

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-squircle">
        <div className="absolute top-16 left-4 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute bottom-20 right-6 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '4s' }}></div>
      </div>
    </div>
  );
};

export default ChatPanel;
