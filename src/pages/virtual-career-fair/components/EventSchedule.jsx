import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Select from 'components/ui/Select';

const EventSchedule = ({ onJoinSession, onAddToAgenda }) => {
  const [selectedDate, setSelectedDate] = useState('2025-07-09');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('list');

  const scheduleData = [
    {
      id: 1,
      title: 'TechCorp Company Presentation',
      company: 'TechCorp',
      type: 'presentation',
      time: '10:00 AM - 10:45 AM',
      duration: '45 min',
      presenter: 'Sarah Johnson, CTO',
      description: 'Learn about our innovative AI solutions and open positions in machine learning.',
      attendees: 234,
      maxAttendees: 500,
      isLive: false,
      inAgenda: true
    },
    {
      id: 2,
      title: 'Frontend Development Panel',
      company: 'Multiple Companies',
      type: 'panel',
      time: '11:00 AM - 12:00 PM',
      duration: '60 min',
      presenter: 'Industry Experts',
      description: 'Panel discussion on modern frontend frameworks and best practices.',
      attendees: 189,
      maxAttendees: 300,
      isLive: true,
      inAgenda: false
    },
    {
      id: 3,
      title: 'One-on-One with DataFlow',
      company: 'DataFlow Inc',
      type: 'meeting',
      time: '2:00 PM - 2:30 PM',
      duration: '30 min',
      presenter: 'Mike Chen, Engineering Manager',
      description: 'Personal interview session for senior backend developer position.',
      attendees: 1,
      maxAttendees: 1,
      isLive: false,
      inAgenda: true
    },
    {
      id: 4,
      title: 'Cloud Architecture Workshop',
      company: 'CloudTech Solutions',
      type: 'workshop',
      time: '3:00 PM - 4:30 PM',
      duration: '90 min',
      presenter: 'Alex Rodriguez, Solutions Architect',
      description: 'Hands-on workshop covering AWS, Azure, and GCP best practices.',
      attendees: 67,
      maxAttendees: 100,
      isLive: false,
      inAgenda: false
    }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Sessions' },
    { value: 'presentation', label: 'Presentations' },
    { value: 'panel', label: 'Panel Discussions' },
    { value: 'meeting', label: 'One-on-One' },
    { value: 'workshop', label: 'Workshops' }
  ];

  const filteredSchedule = scheduleData.filter(session => 
    filterType === 'all' || session.type === filterType
  );

  const getTypeIcon = (type) => {
    const icons = {
      presentation: 'Presentation',
      panel: 'Users',
      meeting: 'User',
      workshop: 'BookOpen'
    };
    return icons[type] || 'Calendar';
  };

  const getTypeColor = (type) => {
    const colors = {
      presentation: 'text-primary bg-primary/10',
      panel: 'text-accent bg-accent/10',
      meeting: 'text-warning bg-warning/10',
      workshop: 'text-success bg-success/10'
    };
    return colors[type] || 'text-muted-foreground bg-muted/10';
  };

  return (
    <div className="bg-card rounded-xl shadow-elevation-2 border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Event Schedule</h3>
            <p className="text-sm text-muted-foreground">July 9, 2025 • Virtual Career Fair</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              iconName="List"
            />
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              iconName="Grid3X3"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <Select
            options={typeOptions}
            value={filterType}
            onChange={setFilterType}
            placeholder="Filter by type"
            className="w-48"
          />
          <Button variant="outline" size="sm" iconName="Calendar" iconPosition="left">
            My Agenda ({scheduleData.filter(s => s.inAgenda).length})
          </Button>
        </div>
      </div>

      {/* Schedule Content */}
      <div className="p-4">
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredSchedule.map((session) => (
              <div
                key={session.id}
                className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-spring"
              >
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(session.type)}`}>
                    <Icon name={getTypeIcon(session.type)} size={20} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground flex items-center space-x-2">
                        <span>{session.title}</span>
                        {session.isLive && (
                          <span className="flex items-center space-x-1 bg-error text-error-foreground px-2 py-1 rounded-full text-xs font-medium">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span>LIVE</span>
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">{session.company} • {session.presenter}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={session.inAgenda ? "default" : "outline"}
                        size="sm"
                        onClick={() => onAddToAgenda(session.id)}
                        iconName={session.inAgenda ? "Check" : "Plus"}
                        iconPosition="left"
                      >
                        {session.inAgenda ? 'In Agenda' : 'Add to Agenda'}
                      </Button>
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
                          disabled={session.attendees >= session.maxAttendees}
                          iconName="Calendar"
                          iconPosition="left"
                        >
                          {session.attendees >= session.maxAttendees ? 'Full' : 'Register'}
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {session.description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={14} />
                      <span>{session.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Timer" size={14} />
                      <span>{session.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Users" size={14} />
                      <span>{session.attendees}/{session.maxAttendees}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSchedule.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-spring"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(session.type)}`}>
                    <Icon name={getTypeIcon(session.type)} size={18} />
                  </div>
                  {session.isLive && (
                    <span className="flex items-center space-x-1 bg-error text-error-foreground px-2 py-1 rounded-full text-xs font-medium">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span>LIVE</span>
                    </span>
                  )}
                </div>

                <h4 className="font-medium text-foreground mb-1">{session.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{session.company}</p>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {session.description}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{session.time}</span>
                  <span>{session.attendees}/{session.maxAttendees}</span>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant={session.inAgenda ? "default" : "outline"}
                    size="sm"
                    onClick={() => onAddToAgenda(session.id)}
                    className="flex-1"
                    iconName={session.inAgenda ? "Check" : "Plus"}
                  >
                    {session.inAgenda ? 'Added' : 'Add'}
                  </Button>
                  {session.isLive ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onJoinSession(session.id)}
                      iconName="Video"
                    >
                      Join
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={session.attendees >= session.maxAttendees}
                      iconName="Calendar"
                    >
                      Register
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

export default EventSchedule;
