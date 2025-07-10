import React from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const CandidateHeader = ({ candidate, onAction }) => {
  const getStatusColor = (status) => {
    const colors = {
      'active': 'text-success bg-success/10',
      'interviewing': 'text-warning bg-warning/10',
      'hired': 'text-primary bg-primary/10',
      'rejected': 'text-error bg-error/10',
      'on-hold': 'text-muted-foreground bg-muted/10'
    };
    return colors[status] || 'text-muted-foreground bg-muted/10';
  };

  const getMatchScore = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="glassmorphic-card p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Image
              src={candidate.avatar}
              alt={candidate.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
            />
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
              candidate.isOnline ? 'bg-success' : 'bg-muted-foreground'
            }`}>
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{candidate.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                {candidate.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center space-x-1">
                <Icon name="MapPin" size={16} />
                <span>{candidate.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Briefcase" size={16} />
                <span>{candidate.experience} years experience</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="DollarSign" size={16} />
                <span>{candidate.expectedSalary}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Match Score:</span>
                <span className={`text-lg font-bold ${getMatchScore(candidate.matchScore)}`}>
                  {candidate.matchScore}%
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Icon name="Star" size={16} className="text-warning fill-current" />
                <span className="text-sm font-medium">{candidate.rating}</span>
                <span className="text-sm text-muted-foreground">({candidate.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="MessageCircle"
            onClick={() => onAction('message')}
          >
            Message
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            iconName="Calendar"
            onClick={() => onAction('schedule')}
          >
            Schedule
          </Button>
          
          <Button
            variant="default"
            size="sm"
            iconName="UserCheck"
            onClick={() => onAction('shortlist')}
          >
            Shortlist
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CandidateHeader;
