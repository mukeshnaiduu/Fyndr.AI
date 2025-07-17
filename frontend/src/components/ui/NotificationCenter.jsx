import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const NotificationCenter = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Course Completed',
      message: 'You have successfully completed "React Advanced Patterns"',
      timestamp: '2 minutes ago',
      read: false,
      icon: 'CheckCircle'
    },
    {
      id: 2,
      type: 'info',
      title: 'New Job Match',
      message: 'Senior Frontend Developer at TechCorp matches your profile',
      timestamp: '15 minutes ago',
      read: false,
      icon: 'Briefcase'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Profile Incomplete',
      message: 'Complete your profile to get better job recommendations',
      timestamp: '1 hour ago',
      read: true,
      icon: 'AlertTriangle'
    },
    {
      id: 4,
      type: 'info',
      title: 'AI Coach Available',
      message: 'Your career coach is ready for your next session',
      timestamp: '2 hours ago',
      read: true,
      icon: 'MessageCircle'
    },
    {
      id: 5,
      type: 'success',
      title: 'Skill Assessment',
      message: 'You scored 95% on JavaScript fundamentals assessment',
      timestamp: '1 day ago',
      read: true,
      icon: 'Award'
    }
  ]);

  const dropdownRef = useRef(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  const getNotificationColor = (type) => {
    const colors = {
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error',
      info: 'text-primary'
    };
    return colors[type] || 'text-muted-foreground';
  };

  const getNotificationBg = (type) => {
    const backgrounds = {
      success: 'bg-success/10',
      warning: 'bg-warning/10',
      error: 'bg-error/10',
      info: 'bg-primary/10'
    };
    return backgrounds[type] || 'bg-muted/10';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-white/10"
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center animate-pulse font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 glassmorphic border border-white/20 rounded-lg shadow-glassmorphic-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
              {notifications.length > 0 && (
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllRead}
                      className="text-xs hover:bg-white/10"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearAll}
                    className="hover:bg-white/10"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No notifications yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We'll notify you when something important happens
                </p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`w-full p-3 rounded-lg mb-2 text-left transition-all duration-200 hover:bg-white/10 ${
                      !notification.read ? 'bg-white/5 border border-white/10' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationBg(notification.type)}`}>
                        <Icon 
                          name={notification.icon} 
                          size={16} 
                          className={getNotificationColor(notification.type)}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium truncate ${
                            !notification.read ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center hover:bg-white/10"
                onClick={() => {
                  console.log('View all notifications');
                  setIsOpen(false);
                }}
              >
                View All Notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
