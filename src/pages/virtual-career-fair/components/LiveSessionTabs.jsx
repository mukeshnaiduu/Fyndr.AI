import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const LiveSessionTabs = ({ sessions, onJoinSession }) => {
  const [activeTab, setActiveTab] = useState('presentations');

  const sessionTypes = [
    { id: 'presentations', label: 'Company Presentations', icon: 'Presentation' },
    { id: 'panels', label: 'Panel Discussions', icon: 'Users' },
    { id: 'meetings', label: 'One-on-One', icon: 'User' },
    { id: 'workshops', label: 'Workshops', icon: 'BookOpen' }
  ];

  const filteredSessions = sessions.filter(session => session.type === activeTab);

  return (
    <div className="bg-card rounded-xl shadow-elevation-2 border border-border">
      {/* Tab Headers */}
      <div className="border-b border-border">
        <div className="flex overflow-x-auto scrollbar-hide">
          {sessionTypes.map((type) => {
            const count = sessions.filter(s => s.type === type.id).length;
            return (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-spring whitespace-nowrap ${
                  activeTab === type.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon name={type.icon} size={16} />
                <span>{type.label}</span>
                {count > 0 && (
                  <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Session Content */}
      <div className="p-4">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No sessions scheduled for this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-spring"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-foreground">{session.title}</h4>
                    {session.isLive && (
                      <span className="flex items-center space-x-1 bg-error text-error-foreground px-2 py-1 rounded-full text-xs font-medium">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span>LIVE</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center space-x-1">
                      <Icon name="Building" size={14} />
                      <span>{session.company}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={14} />
                      <span>{session.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Users" size={14} />
                      <span>{session.participants}/{session.maxParticipants}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {session.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {session.isLive ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onJoinSession(session.id)}
                      iconName="Video"
                      iconPosition="left"
                    >
                      Join Now
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={session.participants >= session.maxParticipants}
                      iconName="Calendar"
                      iconPosition="left"
                    >
                      {session.participants >= session.maxParticipants ? 'Full' : 'Register'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSessionTabs;
