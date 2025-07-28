import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ActivityFeed = () => {
  const [activities] = useState([
    {
      id: 1,
      type: 'candidate_applied',
      user: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9d3c133?w=150',
      action: 'applied for',
      target: 'Senior Frontend Developer',
      timestamp: '2 minutes ago',
      icon: 'UserPlus',
      color: 'text-success'
    },
    {
      id: 2,
      type: 'interview_scheduled',
      user: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      action: 'interview scheduled for',
      target: 'Full Stack Developer',
      timestamp: '15 minutes ago',
      icon: 'Calendar',
      color: 'text-primary'
    },
    {
      id: 3,
      type: 'candidate_moved',
      user: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      action: 'moved to Final stage for',
      target: 'Backend Developer',
      timestamp: '1 hour ago',
      icon: 'ArrowRight',
      color: 'text-warning'
    },
    {
      id: 4,
      type: 'job_posted',
      user: 'System',
      avatar: null,
      action: 'new job posted:',
      target: 'DevOps Engineer',
      timestamp: '2 hours ago',
      icon: 'Briefcase',
      color: 'text-accent'
    },
    {
      id: 5,
      type: 'offer_sent',
      user: 'Lisa Wang',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      action: 'offer sent for',
      target: 'UI/UX Designer',
      timestamp: '3 hours ago',
      icon: 'Mail',
      color: 'text-success'
    },
    {
      id: 6,
      type: 'candidate_rejected',
      user: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      action: 'application rejected for',
      target: 'DevOps Engineer',
      timestamp: '4 hours ago',
      icon: 'X',
      color: 'text-error'
    }
  ]);

  const [filter, setFilter] = useState('all');

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  const getActivityIcon = (activity) => {
    if (activity.avatar) {
      return (
        <Image
          src={activity.avatar}
          alt={activity.user}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center">
        <Icon name={activity.icon} size={16} className={activity.color} />
      </div>
    );
  };

  return (
    <div className="glassmorphic-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="glassmorphic border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground bg-transparent"
        >
          <option value="all">All Activities</option>
          <option value="candidate_applied">Applications</option>
          <option value="interview_scheduled">Interviews</option>
          <option value="candidate_moved">Stage Changes</option>
          <option value="job_posted">Job Posts</option>
          <option value="offer_sent">Offers</option>
        </select>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredActivities.map((activity, index) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 glassmorphic-surface rounded-lg hover:bg-white/10 transition-all duration-200">
            <div className="flex-shrink-0 relative">
              {getActivityIcon(activity)}
              {index < filteredActivities.length - 1 && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-px h-6 bg-white/10"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-foreground">{activity.user}</span>
                <span className="text-sm text-muted-foreground">{activity.action}</span>
                <span className="font-medium text-primary">{activity.target}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Icon name={activity.icon} size={14} className={activity.color} />
                <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <button className="p-1 hover:bg-white/10 rounded transition-colors duration-200">
                <Icon name="MoreHorizontal" size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <button className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors duration-200">
          View All Activities
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
