import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const ProfileModal = ({ isOpen, onClose, profile }) => {
  const [activeTab, setActiveTab] = useState('about');
  const [isConnected, setIsConnected] = useState(false);

  if (!isOpen || !profile) return null;

  const handleConnect = () => {
    setIsConnected(!isConnected);
  };

  const tabs = [
    { id: 'about', label: 'About', icon: 'User' },
    { id: 'experience', label: 'Experience', icon: 'Briefcase' },
    { id: 'connections', label: 'Connections', icon: 'Users' },
    { id: 'activity', label: 'Activity', icon: 'Activity' }
  ];

  const experience = [
    {
      id: 1,
      title: 'Senior Product Manager',
      company: 'Google',
      duration: '2022 - Present',
      location: 'Mountain View, CA',
      description: 'Leading product strategy for Google Search features, managing cross-functional teams of 15+ engineers and designers.'
    },
    {
      id: 2,
      title: 'Product Manager',
      company: 'Facebook',
      duration: '2020 - 2022',
      location: 'Menlo Park, CA',
      description: 'Managed Instagram Stories product, driving 25% increase in user engagement through innovative features.'
    },
    {
      id: 3,
      title: 'Associate Product Manager',
      company: 'Microsoft',
      duration: '2018 - 2020',
      location: 'Seattle, WA',
      description: 'Worked on Office 365 suite, focusing on collaboration tools and user experience improvements.'
    }
  ];

  const mutualConnections = [
    {
      id: 1,
      name: 'Michael Chen',
      title: 'Software Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Emily Rodriguez',
      title: 'UX Designer',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'David Kim',
      title: 'Data Scientist',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'post',
      content: 'Excited to share that our team just launched a new feature that will help millions of users!',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'connection',
      content: 'Connected with Alex Thompson',
      timestamp: '1 day ago'
    },
    {
      id: 3,
      type: 'referral',
      content: 'Successfully referred Emma Wilson for UX Designer position at Airbnb',
      timestamp: '3 days ago'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden glassmorphic rounded-xl shadow-elevation-4">
        {/* Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-primary to-accent"></div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex items-end space-x-4 -mt-16">
              <div className="relative">
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800"
                />
                {profile.isOnline && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
                )}
              </div>
              
              <div className="flex-1 pt-16">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
                      {profile.isVerified && (
                        <Icon name="CheckCircle" size={20} className="text-blue-500" />
                      )}
                    </div>
                    <p className="text-lg text-muted-foreground">{profile.title}</p>
                    <p className="text-muted-foreground">{profile.company}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Icon name="MapPin" size={14} />
                        <span>{profile.location}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Icon name="GraduationCap" size={14} />
                        <span>Class of {profile.graduationYear}</span>
                      </span>
                      <span>{profile.connections} connections</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="icon">
                      <Icon name="MessageCircle" size={20} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Icon name="Mail" size={20} />
                    </Button>
                    <Button
                      variant={isConnected ? "outline" : "default"}
                      onClick={handleConnect}
                    >
                      {isConnected ? (
                        <>
                          <Icon name="Check" size={16} className="mr-2" />
                          Connected
                        </>
                      ) : (
                        <>
                          <Icon name="UserPlus" size={16} className="mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                      <Icon name="X" size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 px-6">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 border-b-2 transition-spring ${
                  activeTab === tab.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">About</h3>
                <p className="text-foreground leading-relaxed">{profile.bio}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-3">Industry</h3>
                <p className="text-foreground">{profile.industry}</p>
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-foreground">Work Experience</h3>
              {experience.map(exp => (
                <div key={exp.id} className="border-l-2 border-primary/20 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{exp.title}</h4>
                      <p className="text-primary font-medium">{exp.company}</p>
                      <p className="text-sm text-muted-foreground">{exp.location}</p>
                      <p className="text-sm text-muted-foreground">{exp.duration}</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Mutual Connections ({profile.mutualConnections})
                </h3>
                <div className="space-y-3">
                  {mutualConnections.map(connection => (
                    <div key={connection.id} className="flex items-center space-x-3">
                      <Image
                        src={connection.avatar}
                        alt={connection.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-foreground">{connection.name}</p>
                        <p className="text-sm text-muted-foreground">{connection.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Button variant="outline" className="w-full">
                  View All Connections
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-foreground">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-foreground">{activity.content}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
