import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const MentorProfileModal = ({ mentor, isOpen, onClose, onBookSession, onStartChat }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSessionType, setSelectedSessionType] = useState('consultation');

  if (!isOpen || !mentor) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'availability', label: 'Availability', icon: 'Calendar' },
    { id: 'reviews', label: 'Reviews', icon: 'Star' },
    { id: 'sessions', label: 'Session Types', icon: 'Video' }
  ];

  const sessionTypes = [
    {
      id: 'consultation',
      name: 'One-time Consultation',
      duration: '60 minutes',
      price: mentor.hourlyRate,
      description: 'Perfect for specific questions or career advice',
      features: ['Career guidance', 'Resume review', 'Interview prep', 'Q&A session']
    },
    {
      id: 'mentorship',
      name: 'Ongoing Mentorship',
      duration: '4 sessions/month',
      price: mentor.hourlyRate * 4 * 0.85,
      description: 'Long-term career development and guidance',
      features: ['Monthly 1:1 sessions', 'Email support', 'Goal tracking', 'Career roadmap']
    },
    {
      id: 'group',
      name: 'Group Session',
      duration: '90 minutes',
      price: mentor.hourlyRate * 0.6,
      description: 'Learn with peers in a collaborative environment',
      features: ['Small group (4-6 people)', 'Interactive discussions', 'Networking', 'Shared resources']
    }
  ];

  const mockAvailability = [
    { date: '2025-07-10', slots: ['09:00', '11:00', '14:00', '16:00'] },
    { date: '2025-07-11', slots: ['10:00', '13:00', '15:00'] },
    { date: '2025-07-12', slots: ['09:00', '12:00', '17:00'] },
    { date: '2025-07-13', slots: ['11:00', '14:00', '16:00'] },
    { date: '2025-07-14', slots: ['10:00', '15:00'] }
  ];

  const mockReviews = [
    {
      id: 1,
      author: 'Sarah Johnson',
      rating: 5,
      date: '2025-07-05',
      comment: `Excellent mentor! ${mentor.name} provided invaluable insights into the tech industry and helped me prepare for my interviews. Highly recommended!`,
      sessionType: 'One-time Consultation'
    },
    {
      id: 2,
      author: 'Michael Chen',
      rating: 5,
      date: '2025-07-02',
      comment: `Great experience working with ${mentor.name}. The ongoing mentorship program really helped me advance my career. Very knowledgeable and supportive.`,
      sessionType: 'Ongoing Mentorship'
    },
    {
      id: 3,
      author: 'Emily Rodriguez',
      rating: 4,
      date: '2025-06-28',
      comment: `Professional and insightful. ${mentor.name} gave me practical advice that I could implement immediately. Would definitely book again.`,
      sessionType: 'One-time Consultation'
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="Star"
        size={14}
        className={`${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glassmorphic rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <Image
                src={mentor.avatar}
                alt={mentor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{mentor.name}</h2>
              <p className="text-muted-foreground">{mentor.title}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  {renderStars(Math.floor(mentor.rating))}
                  <span className="text-sm font-medium text-foreground ml-1">
                    {mentor.rating} ({mentor.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>
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
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">About</h3>
                <p className="text-muted-foreground leading-relaxed">{mentor.bio}</p>
              </div>

              {/* Expertise */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 glassmorphic rounded-lg">
                  <div className="text-2xl font-bold text-primary">{mentor.totalSessions}</div>
                  <div className="text-sm text-muted-foreground">Sessions</div>
                </div>
                <div className="text-center p-4 glassmorphic rounded-lg">
                  <div className="text-2xl font-bold text-primary">{mentor.experience}</div>
                  <div className="text-sm text-muted-foreground">Years Exp.</div>
                </div>
                <div className="text-center p-4 glassmorphic rounded-lg">
                  <div className="text-2xl font-bold text-primary">{mentor.successRate}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center p-4 glassmorphic rounded-lg">
                  <div className="text-2xl font-bold text-primary">{mentor.responseTime}</div>
                  <div className="text-sm text-muted-foreground">Response</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Available Time Slots</h3>
              {mockAvailability.map((day) => (
                <div key={day.date} className="glassmorphic rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-3">{formatDate(day.date)}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {day.slots.map((slot) => (
                      <button
                        key={slot}
                        className="px-3 py-2 text-sm border border-primary/20 rounded-lg hover:bg-primary/10 hover:border-primary/40 transition-spring text-foreground"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Reviews & Testimonials</h3>
              {mockReviews.map((review) => (
                <div key={review.id} className="glassmorphic rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">{review.author}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{review.sessionType}</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Session Types</h3>
              {sessionTypes.map((session) => (
                <div
                  key={session.id}
                  className={`glassmorphic rounded-lg p-4 cursor-pointer transition-spring ${
                    selectedSessionType === session.id ? 'border-2 border-primary' : 'border border-white/20'
                  }`}
                  onClick={() => setSelectedSessionType(session.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">{session.name}</h4>
                      <p className="text-sm text-muted-foreground">{session.duration}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">${session.price}</div>
                      {session.id === 'mentorship' && (
                        <div className="text-xs text-green-500">15% discount</div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{session.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {session.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">${mentor.hourlyRate}/hr</div>
              <div className="text-sm text-muted-foreground">Starting from</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              iconName="MessageCircle"
              iconPosition="left"
              onClick={() => onStartChat(mentor)}
            >
              Start Chat
            </Button>
            <Button
              variant="default"
              iconName="Calendar"
              iconPosition="left"
              onClick={() => onBookSession(mentor)}
            >
              Book Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfileModal;
