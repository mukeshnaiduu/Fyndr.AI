import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const CommunicationHistory = ({ candidate }) => {
  const [activeTab, setActiveTab] = useState('messages');
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('message');

  const communicationHistory = [
    {
      id: 1,
      type: 'email',
      subject: 'Application Received - Frontend Developer Position',
      content: 'Thank you for your application for the Frontend Developer position. We have received your resume and will review it shortly.',
      sender: 'recruiter',
      timestamp: '2025-01-08T10:30:00Z',
      status: 'sent'
    },
    {
      id: 2,
      type: 'message',
      content: 'Hi Sarah, I reviewed your portfolio and I\'m impressed with your React projects. Would you be available for a quick call this week?',
      sender: 'recruiter',
      timestamp: '2025-01-08T14:15:00Z',
      status: 'sent'
    },
    {
      id: 3,
      type: 'message',
      content: 'Hi! Thank you for reaching out. I\'d be happy to discuss the opportunity. I\'m available Thursday or Friday afternoon.',
      sender: 'candidate',
      timestamp: '2025-01-08T16:45:00Z',
      status: 'received'
    },
    {
      id: 4,
      type: 'call',
      subject: 'Initial Screening Call',
      content: 'Duration: 30 minutes\nDiscussed: Background, experience with React, salary expectations\nOutcome: Positive, proceed to technical interview',
      sender: 'recruiter',
      timestamp: '2025-01-09T11:00:00Z',
      status: 'completed'
    }
  ];

  const emailTemplates = [
    {
      id: 'interview-invite',
      name: 'Interview Invitation',
      subject: 'Interview Invitation - {{position}} at {{company}}',
      content: `Hi {{candidateName}},\n\nWe were impressed with your application and would like to invite you for an interview for the {{position}} position.\n\nInterview Details:\nDate: {{date}}\nTime: {{time}}\nDuration: {{duration}}\nFormat: {{format}}\n\nPlease confirm your availability.\n\nBest regards,\n{{recruiterName}}`
    },
    {
      id: 'follow-up',
      name: 'Follow-up',
      subject: 'Following up on your application',
      content: `Hi {{candidateName}},\n\nI wanted to follow up on your application for the {{position}} position. We're currently reviewing applications and will get back to you soon.\n\nThank you for your patience.\n\nBest regards,\n{{recruiterName}}`
    },
    {
      id: 'rejection',name: 'Rejection (Polite)',subject: 'Update on your application',
      content: `Hi {{candidateName}},\n\nThank you for your interest in the {{position}} position and for taking the time to interview with us.\n\nAfter careful consideration, we have decided to move forward with another candidate whose experience more closely matches our current needs.\n\nWe were impressed with your skills and encourage you to apply for future opportunities that match your background.\n\nBest regards,\n{{recruiterName}}`
    }
  ];

  const tabs = [
    { id: 'messages', label: 'Messages', icon: 'MessageCircle' },
    { id: 'emails', label: 'Emails', icon: 'Mail' },
    { id: 'calls', label: 'Calls', icon: 'Phone' },
    { id: 'compose', label: 'Compose', icon: 'Edit' }
  ];

  const getMessageIcon = (type) => {
    const icons = {
      email: 'Mail',
      message: 'MessageCircle',
      call: 'Phone',
      note: 'FileText'
    };
    return icons[type] || 'MessageCircle';
  };

  const getMessageColor = (type) => {
    const colors = {
      email: 'text-primary',
      message: 'text-accent',
      call: 'text-warning',
      note: 'text-muted-foreground'
    };
    return colors[type] || 'text-muted-foreground';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const renderMessages = () => (
    <div className="space-y-4">
      {communicationHistory.map((item) => (
        <div key={item.id} className={`flex space-x-3 ${
          item.sender === 'recruiter' ? 'justify-end' : 'justify-start'
        }`}>
          <div className={`max-w-[70%] ${
            item.sender === 'recruiter' ? 'order-2' : 'order-1'
          }`}>
            <div className={`glassmorphic-surface p-4 rounded-lg ${
              item.sender === 'recruiter' ?'bg-primary/10 border-primary/20' :'bg-white/10 border-white/20'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Icon name={getMessageIcon(item.type)} size={16} className={getMessageColor(item.type)} />
                <span className="text-sm font-medium text-foreground">
                  {item.sender === 'recruiter' ? 'You' : candidate.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
              {item.subject && (
                <div className="font-medium text-foreground mb-1">{item.subject}</div>
              )}
              <div className="text-sm text-foreground whitespace-pre-wrap">{item.content}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCompose = () => (
    <div className="space-y-4">
      <div className="glassmorphic-surface p-4 rounded-lg">
        <h3 className="font-semibold text-foreground mb-4">Quick Templates</h3>
        <div className="grid grid-cols-1 gap-2">
          {emailTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => setNewMessage(template.content)}
              className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200"
            >
              <div className="text-left">
                <div className="font-medium text-foreground">{template.name}</div>
                <div className="text-sm text-muted-foreground">{template.subject}</div>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      <div className="glassmorphic-surface p-4 rounded-lg">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex space-x-2">
            {[
              { value: 'message', label: 'Message', icon: 'MessageCircle' },
              { value: 'email', label: 'Email', icon: 'Mail' },
              { value: 'note', label: 'Note', icon: 'FileText' }
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setMessageType(type.value)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  messageType === type.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/10 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={type.icon} size={16} />
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {messageType === 'email' && (
          <Input
            label="Subject"
            placeholder="Enter email subject"
            className="mb-4"
          />
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            {messageType === 'email' ? 'Email Content' : 
             messageType === 'note' ? 'Note' : 'Message'}
          </label>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full h-32 p-3 bg-white/10 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder={`Type your ${messageType} here...`}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Paperclip" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Attach files</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Save Draft
            </Button>
            <Button onClick={handleSendMessage} iconName="Send">
              Send {messageType}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'messages': case'emails': case'calls':
        return renderMessages();
      case 'compose':
        return renderCompose();
      default:
        return renderMessages();
    }
  };

  return (
    <div className="glassmorphic-card p-6">
      <h2 className="text-xl font-bold text-foreground mb-6">Communication</h2>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-muted/10 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
            }`}
          >
            <Icon name={tab.icon} size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Quick Actions */}
      {activeTab !== 'compose' && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              iconName="MessageCircle"
              onClick={() => setActiveTab('compose')}
            >
              Quick Message
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              iconName="Calendar"
            >
              Schedule Call
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              iconName="Mail"
            >
              Send Email
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationHistory;
