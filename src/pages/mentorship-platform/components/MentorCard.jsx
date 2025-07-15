import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const MentorCard = ({ mentor, onViewProfile, onStartChat, onBookSession }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (status) => {
    switch (status) {
      case 'available':
        return 'Available Now';
      case 'busy':
        return 'In Session';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <div 
      className="glassmorphic rounded-xl p-6 transition-spring hover:shadow-elevation-3 hover:scale-105 cursor-pointer relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewProfile(mentor)}
    >
      {/* Header with Avatar, Info, and Price (responsive) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
        <div className="relative flex-shrink-0 mb-2 sm:mb-0">
          <div className="w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={mentor.avatar}
              alt={mentor.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getAvailabilityColor(mentor.availability)} rounded-full border-2 border-white`} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-1">{mentor.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{mentor.title}</p>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Icon name="Star" size={14} className="text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-foreground">{mentor.rating}</span>
              <span className="text-xs text-muted-foreground">({mentor.reviewCount})</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <span className="text-xs text-muted-foreground">{mentor.experience} years</span>
          </div>
          {/* Price and status on mobile */}
          <div className="flex flex-col items-start mt-2 sm:hidden">
            <p className="text-lg font-bold text-primary">${mentor.hourlyRate}/hr</p>
            <p className="text-xs text-muted-foreground">{getAvailabilityText(mentor.availability)}</p>
          </div>
        </div>

        {/* Price and status on desktop */}
        <div className="hidden sm:flex flex-col items-end w-24 whitespace-nowrap">
          <p className="text-lg font-bold text-primary">${mentor.hourlyRate}/hr</p>
          <p className="text-xs text-muted-foreground">{getAvailabilityText(mentor.availability)}</p>
        </div>
      </div>

      {/* Expertise Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {mentor.expertise.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
          >
            {skill}
          </span>
        ))}
        {mentor.expertise.length > 3 && (
          <span className="px-2 py-1 bg-muted/20 text-muted-foreground text-xs rounded-full">
            +{mentor.expertise.length - 3} more
          </span>
        )}
      </div>

      {/* Bio Preview */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {mentor.bio}
      </p>

      {/* Session Stats */}
      <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Icon name="Users" size={12} />
          <span>{mentor.totalSessions} sessions</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Clock" size={12} />
          <span>Avg {mentor.responseTime}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Award" size={12} />
          <span>{mentor.successRate}% success</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          iconName="MessageCircle"
          iconPosition="left"
          iconSize={14}
          onClick={() => onStartChat(mentor)}
        >
          Chat
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          iconName="Calendar"
          iconPosition="left"
          iconSize={14}
          onClick={() => onBookSession(mentor)}
          disabled={mentor.availability === 'offline'}
        >
          Book
        </Button>
      </div>

      {/* Hover Effect Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl pointer-events-none" />
      )}
    </div>
  );
};

export default MentorCard;
