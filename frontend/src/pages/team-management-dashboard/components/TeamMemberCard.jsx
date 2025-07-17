import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Image from 'components/AppImage';

const TeamMemberCard = ({ member, onRoleChange, onMessage, onManageAccess }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'away': return 'bg-warning';
      case 'offline': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-error/10 text-error';
      case 'manager': return 'bg-primary/10 text-primary';
      case 'recruiter': return 'bg-accent/10 text-accent';
      case 'coordinator': return 'bg-warning/10 text-warning';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <div className="glass-card p-6 hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={member.avatar}
              alt={member.name}
              className="w-full h-full rounded-full object-cover"
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(member.status)}`} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{member.email}</p>
          </div>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Icon name="MoreVertical" size={16} />
          </Button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 w-48 glass-card border border-glass-border rounded-card shadow-glass z-50">
              <div className="p-2">
                <button
                  onClick={() => {
                    onRoleChange(member.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-left hover:bg-muted rounded transition-colors"
                >
                  <Icon name="UserCog" size={16} />
                  <span>Change Role</span>
                </button>
                <button
                  onClick={() => {
                    onManageAccess(member.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-left hover:bg-muted rounded transition-colors"
                >
                  <Icon name="Shield" size={16} />
                  <span>Manage Access</span>
                </button>
                <button
                  onClick={() => {
                    onMessage(member.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-left hover:bg-muted rounded transition-colors"
                >
                  <Icon name="MessageCircle" size={16} />
                  <span>Send Message</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Role</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(member.role)}`}>
            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Department</span>
          <span className="text-sm font-medium text-foreground">{member.department}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Last Login</span>
          <span className="text-sm text-foreground">{member.lastLogin}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Permissions</span>
          <div className="flex items-center space-x-1">
            {member.permissions.slice(0, 3).map((permission, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-primary"
                title={permission}
              />
            ))}
            {member.permissions.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{member.permissions.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-glass-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMessage(member.id)}
          iconName="MessageCircle"
          iconPosition="left"
          className="flex-1"
        >
          Message
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onManageAccess(member.id)}
          iconName="Settings"
          iconPosition="left"
          className="flex-1"
        >
          Manage
        </Button>
      </div>
    </div>
  );
};

export default TeamMemberCard;
