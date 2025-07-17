import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const HackathonTimeline = ({ onFilterChange, onViewChange }) => {
  const [currentView, setCurrentView] = useState('timeline');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date());

  const filters = [
    { id: 'all', label: 'All Events', icon: 'Calendar' },
    { id: 'upcoming', label: 'Upcoming', icon: 'Clock' },
    { id: 'ongoing', label: 'Ongoing', icon: 'Play' },
    { id: 'registration-open', label: 'Registration Open', icon: 'UserPlus' },
    { id: 'featured', label: 'Featured', icon: 'Star' }
  ];

  const timelineEvents = [
    {
      id: 1,
      title: "AI Innovation Challenge",
      date: "2025-07-15",
      time: "09:00 AM",
      type: "hackathon",
      status: "upcoming",
      duration: "48 hours",
      participants: 250,
      registrationDeadline: "2025-07-12",
      featured: true,
      description: "Build innovative AI solutions for healthcare",
      icon: "Brain",
      color: "text-primary bg-primary/10 border-primary/20"
    },
    {
      id: 2,
      title: "Blockchain Revolution",
      date: "2025-07-20",
      time: "10:00 AM",
      type: "hackathon",
      status: "registration-open",
      duration: "72 hours",
      participants: 180,
      registrationDeadline: "2025-07-18",
      featured: false,
      description: "Decentralized solutions for financial inclusion",
      icon: "Link",
      color: "text-accent bg-accent/10 border-accent/20"
    },
    {
      id: 3,
      title: "Green Tech Challenge",
      date: "2025-07-25",
      time: "08:00 AM",
      type: "competition",
      status: "upcoming",
      duration: "5 days",
      participants: 320,
      registrationDeadline: "2025-07-22",
      featured: true,
      description: "Sustainable technology for environmental impact",
      icon: "Leaf",
      color: "text-success bg-success/10 border-success/20"
    },
    {
      id: 4,
      title: "Mobile App Marathon",
      date: "2025-08-01",
      time: "12:00 PM",
      type: "hackathon",
      status: "registration-open",
      duration: "36 hours",
      participants: 150,
      registrationDeadline: "2025-07-30",
      featured: false,
      description: "Cross-platform mobile solutions",
      icon: "Smartphone",
      color: "text-warning bg-warning/10 border-warning/20"
    },
    {
      id: 5,
      title: "Web3 Developer Contest",
      date: "2025-08-10",
      time: "09:00 AM",
      type: "competition",
      status: "upcoming",
      duration: "7 days",
      participants: 200,
      registrationDeadline: "2025-08-07",
      featured: true,
      description: "Next-generation decentralized applications",
      icon: "Globe",
      color: "text-error bg-error/10 border-error/20"
    }
  ];

  const calendarEvents = [
    { date: 15, events: [timelineEvents[0]] },
    { date: 20, events: [timelineEvents[1]] },
    { date: 25, events: [timelineEvents[2]] }
  ];

  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId);
    onFilterChange(filterId);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    onViewChange(view);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-warning bg-warning/10 border-warning/20';
      case 'ongoing': return 'text-success bg-success/10 border-success/20';
      case 'registration-open': return 'text-primary bg-primary/10 border-primary/20';
      case 'completed': return 'text-muted-foreground bg-muted/10 border-muted/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getDaysUntil = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `${diffDays} days`;
    return 'Past';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayEvents = calendarEvents.find(e => e.date === current.getDate() && current.getMonth() === month);
      days.push({
        date: current.getDate(),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString(),
        events: dayEvents ? dayEvents.events : []
      });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  return (
    <div className="glassmorphic rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <Icon name="Calendar" size={24} className="text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Event Timeline</h2>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => handleViewChange('timeline')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-spring ${
              currentView === 'timeline' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="List" size={16} />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => handleViewChange('calendar')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-spring ${
              currentView === 'calendar' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="Calendar" size={16} />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleFilterChange(filter.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-spring ${
              selectedFilter === filter.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10'
            }`}
          >
            <Icon name={filter.icon} size={16} />
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Timeline View */}
      {currentView === 'timeline' && (
        <div className="space-y-4">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline Line */}
              {index !== timelineEvents.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-white/20"></div>
              )}
              
              <div className="flex items-start space-x-4">
                {/* Timeline Dot */}
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${event.color}`}>
                  <Icon name={event.icon} size={20} />
                </div>
                
                {/* Event Content */}
                <div className="flex-1 bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-2 sm:space-y-0">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                        {event.featured && (
                          <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full border border-accent/20">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{formatDate(event.date)}</p>
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Icon name="Clock" size={14} />
                      <span>{event.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Icon name="Users" size={14} />
                      <span>{event.participants} participants</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Icon name="Calendar" size={14} />
                      <span>Register by {formatDate(event.registrationDeadline)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                        {event.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {getDaysUntil(event.date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="default" size="sm">
                        Register
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {currentView === 'calendar' && (
        <div>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth(-1)}
              >
                <Icon name="ChevronLeft" size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth(1)}
              >
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((day, index) => (
              <div
                key={index}
                className={`min-h-20 p-2 border border-white/10 rounded-lg ${
                  day.isCurrentMonth ? 'bg-white/5' : 'bg-white/2'
                } ${day.isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {day.date}
                </div>
                
                {day.events.map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`text-xs p-1 rounded mb-1 truncate ${event.color}`}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonTimeline;
