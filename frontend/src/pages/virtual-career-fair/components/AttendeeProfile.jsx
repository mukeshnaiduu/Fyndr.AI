import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const AttendeeProfile = ({ attendee, onClose, onConnect, onMessage }) => {
  const [connectionNote, setConnectionNote] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect(attendee.id, connectionNote);
      setConnectionNote('');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessage = () => {
    onMessage(attendee.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-elevation-4 border border-border overflow-hidden">
        {/* Header */}
        <div className="relative">
          <div className="h-24 bg-gradient-to-r from-primary/20 to-accent/20" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:bg-white/20"
          >
            <Icon name="X" size={20} />
          </Button>
          
          {/* Profile Picture */}
          <div className="absolute -bottom-8 left-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-card">
                <Image
                  src={attendee.avatar}
                  alt={attendee.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {attendee.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-card" />
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-12 p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">{attendee.name}</h3>
              {attendee.isVerified && (
                <Icon name="BadgeCheck" size={20} className="text-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{attendee.role}</p>
            <p className="text-sm text-muted-foreground">{attendee.company}</p>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Icon name="MapPin" size={12} className="mr-1" />
              {attendee.location}
            </p>
          </div>

          {/* Bio */}
          {attendee.bio && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">About</h4>
              <p className="text-sm text-muted-foreground">{attendee.bio}</p>
            </div>
          )}

          {/* Skills */}
          {attendee.skills && attendee.skills.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {attendee.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {attendee.experience && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Experience</h4>
              <div className="space-y-2">
                {attendee.experience.slice(0, 2).map((exp, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium text-foreground">{exp.title}</p>
                    <p className="text-muted-foreground">{exp.company} • {exp.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {attendee.interests && attendee.interests.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Interests</h4>
              <div className="flex flex-wrap gap-1">
                {attendee.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {attendee.socialLinks && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Connect</h4>
              <div className="flex space-x-2">
                {attendee.socialLinks.linkedin && (
                  <Button variant="outline" size="sm" iconName="Linkedin">
                    LinkedIn
                  </Button>
                )}
                {attendee.socialLinks.github && (
                  <Button variant="outline" size="sm" iconName="Github">
                    GitHub
                  </Button>
                )}
                {attendee.socialLinks.twitter && (
                  <Button variant="outline" size="sm" iconName="Twitter">
                    Twitter
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Connection Note */}
          {!attendee.isConnected && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Connection Note (Optional)</h4>
              <Input
                type="text"
                placeholder="Add a personal note with your connection request..."
                value={connectionNote}
                onChange={(e) => setConnectionNote(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {attendee.isConnected ? (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleMessage}
                  className="flex-1"
                  iconName="MessageCircle"
                  iconPosition="left"
                >
                  Message
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="UserCheck"
                  iconPosition="left"
                >
                  Connected
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleConnect}
                  loading={isConnecting}
                  className="flex-1"
                  iconName="UserPlus"
                  iconPosition="left"
                >
                  Connect
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMessage}
                  iconName="MessageCircle"
                  iconPosition="left"
                >
                  Message
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">{attendee.connections || 0}</div>
              <div className="text-xs text-muted-foreground">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-accent">{attendee.sessionsAttended || 0}</div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-success">{attendee.boothsVisited || 0}</div>
              <div className="text-xs text-muted-foreground">Booths</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendeeProfile;
