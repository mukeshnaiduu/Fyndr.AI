import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const NotificationCard = ({ 
  notification, 
  isSelected, 
  onSelect, 
  onMarkRead, 
  onArchive, 
  onReply,
  index 
}) => {
  const [isHovered, setIsHovered] = useState(false);

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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'interview': return 'Calendar';
      case 'application': return 'FileText';
      case 'message': return 'MessageCircle';
      case 'system': return 'Settings';
      case 'reminder': return 'Clock';
      default: return 'Bell';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'interview': return 'bg-primary/10 text-primary border-primary/20';
      case 'application': return 'bg-accent/10 text-accent border-accent/20';
      case 'message': return 'bg-success/10 text-success border-success/20';
      case 'system': return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
      case 'reminder': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glassmorphic rounded-squircle p-4 spring-transition group cursor-pointer ${
        !notification.read ? 'bg-primary/5 border-primary/20' : 'border-border'
      } ${isSelected ? 'ring-2 ring-primary glow-primary' : ''} ${
        isHovered ? 'elevation-2 glow-primary' : 'elevation-1'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(notification.id)}
    >
      <div className="flex items-start space-x-4">
        {/* Selection Checkbox */}
        <div className="flex items-center pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(notification.id);
            }}
            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
          />
        </div>

        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <Image
              src={notification.avatar}
              alt={notification.sender}
              className="w-12 h-12 rounded-squircle object-cover"
            />
            {!notification.read && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-body font-body-semibold text-foreground truncate">
                {notification.sender}
              </h4>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-caption border ${getTypeColor(notification.type)}`}>
                <Icon name={getTypeIcon(notification.type)} size={12} className="mr-1" />
                {notification.type}
              </span>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className={`text-xs font-caption ${getPriorityColor(notification.priority)}`}>
                {notification.priority}
              </span>
              <span className="text-xs text-muted-foreground font-data">
                {formatTimeAgo(notification.timestamp)}
              </span>
            </div>
          </div>

          <h5 className="text-sm font-body font-body-medium text-foreground mb-1 line-clamp-1">
            {notification.title}
          </h5>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {notification.message}
          </p>

          {/* Tags */}
          {notification.tags && notification.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {notification.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className={`flex items-center space-x-2 spring-transition ${
            isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            {!notification.read && (
              <Button
                variant="ghost"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(notification.id);
                }}
                iconName="Check"
                iconPosition="left"
                iconSize={12}
              >
                Mark Read
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(notification.id);
              }}
              iconName="Archive"
              iconPosition="left"
              iconSize={12}
            >
              Archive
            </Button>

            {notification.type === 'message' && (
              <Button
                variant="ghost"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onReply(notification.id);
                }}
                iconName="Reply"
                iconPosition="left"
                iconSize={12}
              >
                Reply
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-squircle">
        <div className="absolute top-2 right-4 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute bottom-2 left-4 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </motion.div>
  );
};

export default NotificationCard;
