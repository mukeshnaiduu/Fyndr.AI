import React, { useState, useEffect } from 'react';

import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const HackathonCard = ({ hackathon, onRegister, onViewDetails }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const deadline = new Date(hackathon.registrationDeadline);
      const difference = deadline - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
        setIsExpired(false);
      } else {
        setTimeLeft('Registration Closed');
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(timer);
  }, [hackathon.registrationDeadline]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-warning bg-warning/10 border-warning/20';
      case 'ongoing': return 'text-success bg-success/10 border-success/20';
      case 'completed': return 'text-muted-foreground bg-muted/10 border-muted/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-success bg-success/10 border-success/20';
      case 'Intermediate': return 'text-warning bg-warning/10 border-warning/20';
      case 'Advanced': return 'text-error bg-error/10 border-error/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  return (
    <div className="glassmorphic rounded-xl p-6 hover:shadow-elevation-2 transition-spring group">
      {/* Header Image */}
      <div className="relative mb-4 overflow-hidden rounded-lg">
        <Image
          src={hackathon.banner}
          alt={hackathon.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-spring"
        />
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(hackathon.status)}`}>
            {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(hackathon.difficulty)}`}>
            {hackathon.difficulty}
          </span>
        </div>
        {hackathon.featured && (
          <div className="absolute top-3 right-3">
            <div className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Icon name="Star" size={12} />
              <span>Featured</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Title and Theme */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-spring">
            {hackathon.title}
          </h3>
          <p className="text-sm text-muted-foreground">{hackathon.theme}</p>
        </div>

        {/* Date and Duration */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="Calendar" size={16} />
            <span>{hackathon.startDate} - {hackathon.endDate}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Clock" size={16} />
            <span>{hackathon.duration}</span>
          </div>
        </div>

        {/* Prize Pool */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Trophy" size={16} className="text-warning" />
            <span className="text-sm font-medium text-foreground">Prize Pool: {hackathon.prizePool}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Users" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{hackathon.participants} participants</span>
          </div>
        </div>

        {/* Sponsors */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">Sponsored by:</span>
          <div className="flex items-center space-x-2">
            {hackathon.sponsors.slice(0, 3).map((sponsor, index) => (
              <div key={index} className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                <span className="text-xs font-medium text-foreground">{sponsor.charAt(0)}</span>
              </div>
            ))}
            {hackathon.sponsors.length > 3 && (
              <span className="text-xs text-muted-foreground">+{hackathon.sponsors.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Registration Countdown */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Registration {isExpired ? 'Status' : 'Closes In'}</p>
              <p className={`text-sm font-medium ${isExpired ? 'text-error' : 'text-warning'}`}>
                {timeLeft}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Teams Registered</p>
              <p className="text-sm font-medium text-foreground">{hackathon.teamsRegistered}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onRegister(hackathon.id)}
            disabled={isExpired || hackathon.status === 'completed'}
            className="flex-1"
          >
            {hackathon.isRegistered ? 'Registered' : 'Register Now'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(hackathon.id)}
            className="flex-1"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HackathonCard;
