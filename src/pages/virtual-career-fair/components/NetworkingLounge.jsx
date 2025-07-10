import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const NetworkingLounge = () => {
  const [activeRoom, setActiveRoom] = useState('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState({
    general: [
      {
        id: 1,
        user: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        message: 'Hey everyone! Just finished the TechCorp presentation. Anyone else attending?',
        timestamp: '2:30 PM',
        reactions: ['👍', '💼']
      },
      {
        id: 2,
        user: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8b4?w=150',
        message: 'Yes! Their AI team seems really innovative. Looking forward to the Q&A session.',
        timestamp: '2:32 PM',
        reactions: ['🚀']
      }
    ],
    frontend: [
      {
        id: 3,
        user: 'Mike Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        message: 'Anyone working with React 18 and the new concurrent features?',
        timestamp: '2:25 PM',
        reactions: ['⚛️', '🔥']
      }
    ],
    backend: [
      {
        id: 4,
        user: 'Emily Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        message: 'Discussing microservices architecture with the Netflix team. Fascinating insights!',
        timestamp: '2:28 PM',
        reactions: ['🏗️', '💡']
      }
    ]
  });

  const chatRooms = [
    { id: 'general', name: 'General Discussion', icon: 'MessageCircle', count: 45, topic: 'Open discussion' },
    { id: 'frontend', name: 'Frontend Developers', icon: 'Code', count: 23, topic: 'React, Vue, Angular' },
    { id: 'backend', name: 'Backend Engineers', icon: 'Server', count: 31, topic: 'APIs, Databases, Cloud' },
    { id: 'mobile', name: 'Mobile Development', icon: 'Smartphone', count: 18, topic: 'iOS, Android, React Native' },
    { id: 'data', name: 'Data Science', icon: 'BarChart3', count: 27, topic: 'ML, Analytics, Big Data' },
    { id: 'design', name: 'UI/UX Design', icon: 'Palette', count: 19, topic: 'Design Systems, Figma' }
  ];

  const onlineUsers = [
    { id: 1, name: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'Frontend Developer', company: 'TechCorp' },
    { id: 2, name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8b4?w=150', role: 'Product Manager', company: 'InnovateLabs' },
    { id: 3, name: 'Mike Rodriguez', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', role: 'Full Stack Developer', company: 'StartupXYZ' },
    { id: 4, name: 'Emily Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', role: 'Backend Engineer', company: 'CloudTech' }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        user: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        message: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: []
      };
      
      setMessages(prev => ({
        ...prev,
        [activeRoom]: [...(prev[activeRoom] || []), newMessage]
      }));
      setMessage('');
    }
  };

  const currentMessages = messages[activeRoom] || [];

  return (
    <div className="bg-card rounded-xl shadow-elevation-2 border border-border overflow-hidden">
      <div className="flex h-96">
        {/* Room List */}
        <div className="w-64 border-r border-border bg-muted/30">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground mb-2">Chat Rooms</h3>
            <p className="text-xs text-muted-foreground">Join topic-based discussions</p>
          </div>
          
          <div className="overflow-y-auto h-full">
            {chatRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className={`w-full p-3 text-left hover:bg-muted/50 transition-spring border-l-2 ${
                  activeRoom === room.id
                    ? 'bg-primary/10 border-primary text-primary' :'border-transparent text-foreground'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon name={room.icon} size={16} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{room.name}</span>
                      <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        {room.count}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{room.topic}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">
                  {chatRooms.find(r => r.id === activeRoom)?.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {chatRooms.find(r => r.id === activeRoom)?.count} participants
                </p>
              </div>
              <Button variant="outline" size="sm" iconName="Users" iconPosition="left">
                View All
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentMessages.map((msg) => (
              <div key={msg.id} className="flex space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={msg.avatar}
                    alt={msg.user}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{msg.user}</span>
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm text-foreground mb-2">{msg.message}</p>
                  {msg.reactions.length > 0 && (
                    <div className="flex space-x-1">
                      {msg.reactions.map((reaction, index) => (
                        <span key={index} className="text-sm bg-muted px-2 py-1 rounded-full">
                          {reaction}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                type="text"
                placeholder={`Message ${chatRooms.find(r => r.id === activeRoom)?.name}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                variant="default"
                size="icon"
                disabled={!message.trim()}
              >
                <Icon name="Send" size={16} />
              </Button>
            </form>
          </div>
        </div>

        {/* Online Users */}
        <div className="w-64 border-l border-border bg-muted/30">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground mb-2">Online Now</h3>
            <p className="text-xs text-muted-foreground">{onlineUsers.length} people</p>
          </div>
          
          <div className="overflow-y-auto h-full p-2">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg transition-spring">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-card" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkingLounge;
