import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const ChatSidebar = ({ isOpen, onClose, messages = [], onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const mockMessages = [
    {
      id: 1,
      sender: 'interviewer',
      senderName: 'Sarah Chen',
      content: 'Welcome to the interview session! I\'ll be asking you a few questions today.',
      timestamp: new Date(Date.now() - 300000),
      type: 'text'
    },
    {
      id: 2,
      sender: 'user',
      senderName: 'You',
      content: 'Thank you! I\'m excited to get started.',
      timestamp: new Date(Date.now() - 280000),
      type: 'text'
    },
    {
      id: 3,
      sender: 'interviewer',
      senderName: 'Sarah Chen',
      content: 'Great! Let\'s begin with some behavioral questions.',
      timestamp: new Date(Date.now() - 260000),
      type: 'text'
    },
    {
      id: 4,
      sender: 'system',
      senderName: 'System',
      content: 'Question shared: "Tell me about a challenging project you worked on."',
      timestamp: new Date(Date.now() - 240000),
      type: 'system'
    },
    {
      id: 5,
      sender: 'interviewer',
      senderName: 'Sarah Chen',
      content: 'Here\'s a coding challenge link: https://leetcode.com/problems/two-sum',
      timestamp: new Date(Date.now() - 120000),
      type: 'link'
    },
    {
      id: 6,
      sender: 'user',
      senderName: 'You',
      content: 'I can see the problem. Let me work through this step by step.',
      timestamp: new Date(Date.now() - 60000),
      type: 'text'
    }
  ];

  const allMessages = messages.length > 0 ? messages : mockMessages;

  return (
    <div className={`fixed top-16 right-0 bottom-0 w-80 glassmorphic border-l border-white/20 transform transition-transform duration-300 z-30 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    } lg:relative lg:top-0 lg:transform-none lg:${isOpen ? 'block' : 'hidden'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Icon name="MessageCircle" size={20} className="text-primary" />
          <h3 className="font-medium text-foreground">Chat</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
          <Icon name="X" size={16} />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100vh - 200px)' }}>
        {allMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${
              message.sender === 'user' ?'bg-primary text-primary-foreground' 
                : message.sender === 'system' ?'bg-muted text-muted-foreground' :'bg-card text-card-foreground border border-white/10'
            } rounded-lg p-3`}>
              
              {message.sender !== 'user' && message.sender !== 'system' && (
                <p className="text-xs font-medium mb-1 opacity-70">
                  {message.senderName}
                </p>
              )}
              
              {message.type === 'link' ? (
                <div>
                  <p className="text-sm mb-2">{message.content.split('https://')[0]}</p>
                  <a
                    href={message.content.match(/https:\/\/[^\s]+/)?.[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 underline break-all"
                  >
                    {message.content.match(/https:\/\/[^\s]+/)?.[0]}
                  </a>
                </div>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
              
              <p className="text-xs opacity-60 mt-1">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-white/10">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim()}
            className="flex-shrink-0"
          >
            <Icon name="Send" size={16} />
          </Button>
        </form>
        
        {/* Quick Actions */}
        <div className="flex space-x-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setNewMessage('Can you repeat the question?')}
          >
            <Icon name="RotateCcw" size={12} className="mr-1" />
            Repeat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setNewMessage('I need a moment to think.')}
          >
            <Icon name="Clock" size={12} className="mr-1" />
            Time
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setNewMessage('Thank you for the feedback!')}
          >
            <Icon name="ThumbsUp" size={12} className="mr-1" />
            Thanks
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
