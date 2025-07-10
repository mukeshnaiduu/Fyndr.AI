import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const NotificationIndicator = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);

    if (authStatus) {
      // Simulate real-time notifications
      const mockNotifications = [
        {
          id: 1,
          type: 'interview',
          title: 'Interview Scheduled',
          message: 'Your interview with TechCorp is scheduled for tomorrow at 2:00 PM',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          read: false,
          icon: 'Calendar',
          priority: 'high'
        },
        {
          id: 2,
          type: 'application',
          title: 'Application Update',
          message: 'Your application for Senior Developer position has been reviewed',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          read: false,
          icon: 'FileText',
          priority: 'medium'
        },
        {
          id: 3,
          type: 'message',
          title: 'New Message',
          message: 'Sarah from HR sent you a message about the next steps',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: true,
          icon: 'MessageCircle',
          priority: 'low'
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);

      // Simulate WebSocket updates
      const interval = setInterval(() => {
        if (Math.random() > 0.8) { // 20% chance every 10 seconds
          const newNotification = {
            id: Date.now(),
            type: 'system',
            title: 'System Update',
            message: 'Your profile has been updated successfully',
            timestamp: new Date(),
            read: false,
            icon: 'Bell',
            priority: 'low'
          };

          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          setUnreadCount(prev => prev + 1);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Navigate based on notification type
    switch (notification.type) {
      case 'interview': navigate('/video-interview-interface');
        break;
      case 'application': case'message': navigate('/notifications-center');
        break;
      default:
        navigate('/notifications-center');
    }

    setIsDropdownOpen(false);
  };

  const handleViewAll = () => {
    navigate('/notifications-center');
    setIsDropdownOpen(false);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'interview': return 'bg-primary/10 text-primary';
      case 'application': return 'bg-accent/10 text-accent';
      case 'message': return 'bg-success/10 text-success';
      case 'system': return 'bg-secondary/10 text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-squircle spring-transition ripple"
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-data animate-pulse glow-accent">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-dropdown"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 w-80 glassmorphic rounded-squircle elevation-3 z-dropdown border">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-heading font-heading-semibold text-foreground">
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={handleMarkAllRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDropdownOpen(false)}
                  iconName="X"
                  iconSize={16}
                />
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="p-2 space-y-1">
                  {notifications.slice(0, 5).map((notification, index) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left p-3 rounded-squircle spring-transition hover:bg-muted group ${
                        !notification.read ? 'bg-primary/5' : ''
                      } stagger-${index + 1}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-squircle flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                          <Icon name={notification.icon} size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-body font-body-medium text-foreground truncate">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-accent rounded-full"></div>
                              )}
                              <span className="text-xs text-muted-foreground font-data">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs font-caption ${getPriorityColor(notification.priority)}`}>
                              {notification.priority} priority
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No notifications yet
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={handleViewAll}
                  iconName="ArrowRight"
                  iconPosition="right"
                  iconSize={14}
                >
                  View All Notifications
                </Button>
              </div>
            )}

            {/* Ambient Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-squircle">
              <div className="absolute top-4 left-4 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
              <div className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '3s' }}></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationIndicator;
