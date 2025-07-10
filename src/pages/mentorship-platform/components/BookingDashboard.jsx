import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';

const BookingDashboard = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  if (!isOpen) return null;

  const mockBookings = [
    {
      id: 1,
      mentor: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9a1e2b4?w=150&h=150&fit=crop&crop=face',
        title: 'Senior Software Engineer'
      },
      date: '2025-07-10',
      time: '14:00',
      duration: 60,
      type: 'One-time Consultation',
      status: 'confirmed',
      price: 120,
      sessionNotes: 'Career transition discussion',
      recordingUrl: null
    },
    {
      id: 2,
      mentor: {
        name: 'Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        title: 'Product Manager'
      },
      date: '2025-07-12',
      time: '10:00',
      duration: 90,
      type: 'Ongoing Mentorship',
      status: 'pending',
      price: 180,
      sessionNotes: 'Product strategy and roadmap planning',
      recordingUrl: null
    },
    {
      id: 3,
      mentor: {
        name: 'Emily Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        title: 'UX Design Lead'
      },
      date: '2025-07-05',
      time: '16:00',
      duration: 60,
      type: 'One-time Consultation',
      status: 'completed',
      price: 100,
      sessionNotes: 'Portfolio review and feedback',
      recordingUrl: 'https://example.com/recording/3'
    }
  ];

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', icon: 'Calendar' },
    { id: 'completed', label: 'Completed', icon: 'CheckCircle' },
    { id: 'cancelled', label: 'Cancelled', icon: 'XCircle' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = booking.mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesTab = activeTab === 'upcoming' ? ['confirmed', 'pending'].includes(booking.status) :
                      activeTab === 'completed' ? booking.status === 'completed' :
                      booking.status === 'cancelled';
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const handleJoinSession = (booking) => {
    console.log('Joining session:', booking);
    // Implement video session launch
  };

  const handleReschedule = (booking) => {
    console.log('Rescheduling:', booking);
    // Implement reschedule logic
  };

  const handleCancel = (booking) => {
    console.log('Cancelling:', booking);
    // Implement cancel logic
  };

  const handleViewRecording = (booking) => {
    if (booking.recordingUrl) {
      window.open(booking.recordingUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glassmorphic rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Bookings</h2>
            <p className="text-muted-foreground">Manage your mentorship sessions</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={24} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-spring whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground'
              }`}>
                {filteredBookings.length}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 p-4 border-b border-white/10">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            className="w-40"
          />
        </div>

        {/* Bookings List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No bookings found</h3>
              <p className="text-muted-foreground">
                {activeTab === 'upcoming' ? 'You have no upcoming sessions' : 
                 activeTab === 'completed' ? 'No completed sessions yet' : 
                 'No cancelled sessions'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="glassmorphic rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={booking.mentor.avatar}
                          alt={booking.mentor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{booking.mentor.name}</h3>
                        <p className="text-sm text-muted-foreground">{booking.mentor.title}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Icon name="Calendar" size={14} />
                            <span>{formatDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="Clock" size={14} />
                            <span>{formatTime(booking.time)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="Timer" size={14} />
                            <span>{booking.duration} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <p className="text-lg font-bold text-primary mt-2">${booking.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground font-medium">{booking.type}</p>
                      {booking.sessionNotes && (
                        <p className="text-sm text-muted-foreground mt-1">{booking.sessionNotes}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {booking.status === 'confirmed' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            iconName="Video"
                            iconPosition="left"
                            onClick={() => handleJoinSession(booking)}
                          >
                            Join Session
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="Calendar"
                            iconPosition="left"
                            onClick={() => handleReschedule(booking)}
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="X"
                            onClick={() => handleCancel(booking)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="Calendar"
                            iconPosition="left"
                            onClick={() => handleReschedule(booking)}
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="X"
                            onClick={() => handleCancel(booking)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      
                      {booking.status === 'completed' && (
                        <>
                          {booking.recordingUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              iconName="Play"
                              iconPosition="left"
                              onClick={() => handleViewRecording(booking)}
                            >
                              View Recording
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="Star"
                            iconPosition="left"
                          >
                            Rate Session
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDashboard;
