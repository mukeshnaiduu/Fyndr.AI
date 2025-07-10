import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const SmartNotifications = ({ className = '' }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Simulate smart notifications
    const mockNotifications = [
      {
        id: 1,
        type: 'insight',
        title: 'New Career Insight',
        message: 'Based on your recent conversations, consider exploring Product Management roles',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        icon: 'Lightbulb',
        action: 'View Insight',
        priority: 'high'
      },
      {
        id: 2,
        type: 'followup',
        title: 'Follow-up Reminder',
        message: 'Remember to update your LinkedIn profile as discussed yesterday',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        icon: 'Clock',
        action: 'Mark Done',
        priority: 'medium'
      },
      {
        id: 3,
        type: 'recommendation',
        title: 'Course Recommendation',
        message: 'New React Advanced course matches your learning goals',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        icon: 'BookOpen',
        action: 'View Course',
        priority: 'low'
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const handleNotificationAction = (notificationId, action) => {
    console.log(`Action ${action} for notification ${notificationId}`);
    // Remove notification after action
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleDismiss = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-error',
      medium: 'text-warning',
      low: 'text-primary'
    };
    return colors[priority] || 'text-muted-foreground';
  };

  const getPriorityBg = (priority) => {
    const backgrounds = {
      high: 'bg-error/10 border-error/20',
      medium: 'bg-warning/10 border-warning/20',
      low: 'bg-primary/10 border-primary/20'
    };
    return backgrounds[priority] || 'bg-muted/10';
  };

  if (notifications.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative hover:bg-white/10"
      >
        <Icon name="Bell" size={18} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {notifications.length}
          </span>
        )}
      </Button>

      {showNotifications && (
        <div className="absolute top-full right-0 mt-2 w-80 glassmorphic border border-white/20 rounded-lg shadow-glassmorphic-lg z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Smart Insights</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotifications([])}
                className="text-xs hover:bg-white/10"
              >
                Clear All
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered career recommendations
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-white/10 last:border-b-0 ${getPriorityBg(notification.priority)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notification.type === 'insight' ? 'bg-primary/20' :
                    notification.type === 'followup'? 'bg-warning/20' : 'bg-accent/20'
                  }`}>
                    <Icon 
                      name={notification.icon} 
                      size={16} 
                      className={getPriorityColor(notification.priority)}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-foreground text-sm">
                        {notification.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDismiss(notification.id)}
                        className="h-6 w-6 hover:bg-white/10 flex-shrink-0"
                      >
                        <Icon name="X" size={12} />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNotificationAction(notification.id, notification.action)}
                        className="text-xs hover:bg-white/10"
                      >
                        {notification.action}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartNotifications;
