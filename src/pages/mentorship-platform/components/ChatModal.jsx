import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const ChatModal = ({ mentor, isOpen, onClose, onBookSession }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && mentor) {
      // Initialize with welcome message
      setMessages([
        {
          id: 1,
          sender: 'mentor',
          content: `Hi! I'm ${mentor.name}. I'd be happy to help you with your career questions. What would you like to discuss?`,
          timestamp: new Date(),
          type: 'text'
        }
      ]);
    }
  }, [isOpen, mentor]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpen || !mentor) return null;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate mentor response
    setTimeout(() => {
      const mentorResponses = [
        "That\'s a great question! Let me share my thoughts on that.",
        "I\'ve helped many people with similar challenges. Here\'s what I recommend...",
        "Based on my experience in the industry, I'd suggest...",
        "That\'s definitely something we can work on together. Would you like to schedule a session?",
        "I understand your concern. Let me provide some guidance on this topic."
      ];

      const mentorMessage = {
        id: Date.now() + 1,
        sender: 'mentor',
        content: mentorResponses[Math.floor(Math.random() * mentorResponses.length)],
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, mentorMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileMessage = {
        id: Date.now(),
        sender: 'user',
        content: file.name,
        timestamp: new Date(),
        type: 'file',
        fileType: file.type,
        fileSize: file.size
      };

      setMessages(prev => [...prev, fileMessage]);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glassmorphic rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{mentor.name}</h3>
              <p className="text-xs text-muted-foreground">
                {mentor.availability === 'available' ? 'Online' : 'Away'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Calendar"
              iconPosition="left"
              onClick={() => onBookSession(mentor)}
            >
              Book Session
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                {message.sender === 'mentor' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <Image
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{mentor.name}</span>
                  </div>
                )}
                
                <div className={`rounded-2xl px-4 py-2 ${
                  message.sender === 'user' ?'bg-primary text-primary-foreground ml-auto' :'bg-white/10 text-foreground'
                }`}>
                  {message.type === 'text' ? (
                    <p className="text-sm">{message.content}</p>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Icon name="Paperclip" size={16} />
                      <div>
                        <p className="text-sm font-medium">{message.content}</p>
                        <p className="text-xs opacity-70">{formatFileSize(message.fileSize)}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={`text-xs text-muted-foreground mt-1 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-white/10 rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-white/10">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="resize-none"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <Button variant="ghost" size="icon" type="button">
                  <Icon name="Paperclip" size={20} />
                </Button>
              </label>
              
              <Button
                type="submit"
                size="icon"
                disabled={!newMessage.trim()}
              >
                <Icon name="Send" size={20} />
              </Button>
            </div>
          </form>
          
          <p className="text-xs text-muted-foreground mt-2">
            This is a preliminary chat. Book a session for detailed guidance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
