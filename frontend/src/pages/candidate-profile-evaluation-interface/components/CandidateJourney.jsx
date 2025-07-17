import React from 'react';
import Icon from 'components/AppIcon';

const CandidateJourney = ({ candidate }) => {
  const journeySteps = [
    {
      id: 1,
      title: 'Application Submitted',
      description: 'Candidate applied for Frontend Developer position',
      timestamp: '2025-01-07T09:30:00Z',
      status: 'completed',
      icon: 'FileText',
      details: {
        source: 'Company Website',
        resume: 'sarah_johnson_resume.pdf',
        coverLetter: true
      }
    },
    {
      id: 2,
      title: 'Initial Screening',
      description: 'Resume reviewed and candidate shortlisted',
      timestamp: '2025-01-08T11:15:00Z',
      status: 'completed',
      icon: 'Eye',
      details: {
        reviewer: 'John Smith',
        score: '85/100',
        notes: 'Strong technical background, good portfolio'
      }
    },
    {
      id: 3,
      title: 'Phone Screening',
      description: '30-minute phone call completed',
      timestamp: '2025-01-09T14:00:00Z',
      status: 'completed',
      icon: 'Phone',
      details: {
        duration: '30 minutes',
        interviewer: 'Jane Doe',
        outcome: 'Positive - proceed to technical round'
      }
    },
    {
      id: 4,
      title: 'Technical Interview',
      description: 'Technical assessment scheduled',
      timestamp: '2025-01-10T10:00:00Z',
      status: 'scheduled',
      icon: 'Code',
      details: {
        type: 'Live coding session',
        duration: '60 minutes',
        interviewer: 'Mike Johnson',
        topics: ['React', 'JavaScript', 'Problem Solving']
      }
    },
    {
      id: 5,
      title: 'Cultural Fit Interview',
      description: 'Team fit assessment',
      timestamp: '2025-01-11T15:30:00Z',
      status: 'pending',
      icon: 'Users',
      details: {
        type: 'Behavioral interview',
        duration: '45 minutes',
        panel: ['Sarah Wilson', 'Tom Brown']
      }
    },
    {
      id: 6,
      title: 'Final Decision',
      description: 'Final hiring decision',
      timestamp: null,
      status: 'pending',
      icon: 'CheckCircle',
      details: {
        decisionBy: 'Hiring Manager',
        expectedDate: '2025-01-12'
      }
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-success bg-success/20',
      scheduled: 'text-warning bg-warning/20',
      pending: 'text-muted-foreground bg-muted/20',
      cancelled: 'text-error bg-error/20'
    };
    return colors[status] || 'text-muted-foreground bg-muted/20';
  };

  const getStepLineColor = (status) => {
    const colors = {
      completed: 'bg-success',
      scheduled: 'bg-warning',
      pending: 'bg-muted-foreground/30',
      cancelled: 'bg-error'
    };
    return colors[status] || 'bg-muted-foreground/30';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'TBD';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStepDetails = (details) => {
    return Object.entries(details).map(([key, value]) => (
      <div key={key} className="flex justify-between text-sm">
        <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
        <span className="text-foreground font-medium">
          {Array.isArray(value) ? value.join(', ') : value.toString()}
        </span>
      </div>
    ));
  };

  return (
    <div className="glassmorphic-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Candidate Journey</h2>
        <div className="flex items-center space-x-2">
          <Icon name="Clock" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Started {formatTimestamp(journeySteps[0].timestamp)}
          </span>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="glassmorphic-surface p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Overall Progress</span>
          <span className="text-sm text-primary font-medium">
            {journeySteps.filter(step => step.status === 'completed').length} of {journeySteps.length} completed
          </span>
        </div>
        <div className="w-full bg-muted/20 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(journeySteps.filter(step => step.status === 'completed').length / journeySteps.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="space-y-6">
        {journeySteps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Timeline Line */}
            {index < journeySteps.length - 1 && (
              <div className={`absolute left-6 top-12 w-0.5 h-16 ${getStepLineColor(step.status)}`}></div>
            )}
            
            <div className="flex space-x-4">
              {/* Step Icon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 border-white/20 ${
                step.status === 'completed' ? 'bg-success text-white' :
                step.status === 'scheduled'? 'bg-warning text-white' : 'bg-muted/20 text-muted-foreground'
              }`}>
                <Icon name={step.icon} size={20} />
              </div>
              
              {/* Step Content */}
              <div className="flex-1 glassmorphic-surface p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                      {step.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(step.timestamp)}
                    </span>
                  </div>
                </div>
                
                {/* Step Details */}
                {step.details && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {renderStepDetails(step.details)}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                {step.status === 'scheduled' && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors">
                      <Icon name="Edit" size={14} />
                      <span>Reschedule</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 bg-error/20 text-error rounded-lg text-sm hover:bg-error/30 transition-colors">
                      <Icon name="X" size={14} />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <div className="mt-8 glassmorphic-surface p-4 rounded-lg">
        <h3 className="font-semibold text-foreground mb-3">Next Steps</h3>
        <div className="space-y-2">
          {journeySteps
            .filter(step => step.status === 'scheduled' || step.status === 'pending')
            .slice(0, 2)
            .map((step) => (
              <div key={step.id} className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                <Icon name={step.icon} size={16} className="text-primary" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground">{step.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {step.timestamp ? formatTimestamp(step.timestamp) : 'To be scheduled'}
                  </span>
                </div>
                <Icon name="ArrowRight" size={14} className="text-muted-foreground" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateJourney;
