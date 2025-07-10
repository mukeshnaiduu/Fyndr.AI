import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const CompanyBooth = ({ booth, onJoinSession, onVisitBooth }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleVisitBooth = () => {
    onVisitBooth(booth.id);
    setIsExpanded(true);
  };

  return (
    <div className="bg-card rounded-xl shadow-elevation-2 overflow-hidden transition-spring hover:shadow-elevation-3 hover:scale-[1.02] border border-border">
      {/* Company Banner */}
      <div className="relative h-32 overflow-hidden">
        <Image
          src={booth.bannerImage}
          alt={`${booth.companyName} banner`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Live Status */}
        {booth.isLive && (
          <div className="absolute top-3 right-3 flex items-center space-x-1 bg-error/90 text-error-foreground px-2 py-1 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>LIVE</span>
          </div>
        )}
        
        {/* Company Logo */}
        <div className="absolute bottom-3 left-3">
          <div className="w-12 h-12 bg-white rounded-lg p-2 shadow-elevation-2">
            <Image
              src={booth.logo}
              alt={`${booth.companyName} logo`}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Booth Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground text-lg">{booth.companyName}</h3>
            <p className="text-sm text-muted-foreground">{booth.industry}</p>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Icon name="Users" size={14} />
            <span>{booth.visitorCount}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {booth.description}
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-primary">{booth.openPositions}</div>
            <div className="text-xs text-muted-foreground">Open Roles</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-accent">{booth.recruitersOnline}</div>
            <div className="text-xs text-muted-foreground">Recruiters</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-warning">{booth.nextSession}</div>
            <div className="text-xs text-muted-foreground">Next Session</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleVisitBooth}
            className="flex-1"
            iconName="ArrowRight"
            iconPosition="right"
          >
            Visit Booth
          </Button>
          {booth.isLive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onJoinSession(booth.id)}
              iconName="Video"
              iconPosition="left"
            >
              Join Live
            </Button>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-foreground mb-2">Featured Roles</h4>
                <div className="space-y-1">
                  {booth.featuredRoles.slice(0, 3).map((role, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{role.title}</span>
                      <span className="text-muted-foreground">{role.location}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Upcoming Sessions</h4>
                <div className="space-y-1">
                  {booth.upcomingSessions.slice(0, 2).map((session, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{session.title}</span>
                      <span className="text-muted-foreground">{session.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyBooth;
