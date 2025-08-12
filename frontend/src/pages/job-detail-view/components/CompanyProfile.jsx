import React from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const CompanyProfile = ({ company }) => {
  // Safety check for company object
  if (!company || typeof company !== 'object') {
    return (
      <div className="glass-card p-6 mb-6">
        <p className="text-muted-foreground">Company information not available</p>
      </div>
    );
  }

  const cultureMetrics = [
    { label: 'Work-Life Balance', score: company.workLifeBalance || 4, icon: 'Scale' },
    { label: 'Career Growth', score: company.careerGrowth || 4, icon: 'TrendingUp' },
    { label: 'Compensation', score: company.compensation || 4, icon: 'DollarSign' },
    { label: 'Company Culture', score: company.culture || 4, icon: 'Heart' }
  ];

  const getScoreColor = (score) => {
    if (score >= 4) return 'text-success';
    if (score >= 3) return 'text-warning';
    return 'text-error';
  };

  const renderStars = (score) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="Star"
        size={12}
        className={i < score ? 'text-warning fill-current' : 'text-muted'}
      />
    ));
  };

  return (
    <div className="glass-card p-6 mb-6">
      <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
        About {company.name || 'Company'}
      </h3>

      {/* Company Overview */}
      <div className="flex items-start space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-primary rounded-card flex items-center justify-center flex-shrink-0">
          <Icon name="Building" size={24} color="white" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">{company.name || 'Company Name'}</h4>
          <p className="text-sm text-muted-foreground mb-2">{company.industry || 'Industry not specified'}</p>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="Users" size={12} />
              <span>{company.size || 'Size not specified'} employees</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="MapPin" size={12} />
              <span>{company.location || company.headquarters || 'Location not specified'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={12} />
              <span>Founded {company.founded || 'Year not specified'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Company Description */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {company.description || 'Company description not available'}
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-muted rounded-card">
          <div className="text-lg font-semibold text-primary">{company.fundingStage || 'N/A'}</div>
          <div className="text-xs text-muted-foreground">Funding Stage</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-card">
          <div className="text-lg font-semibold text-accent">{company.revenue || 'N/A'}</div>
          <div className="text-xs text-muted-foreground">Annual Revenue</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-card">
          <div className="text-lg font-semibold text-secondary">{company.growth || 'N/A'}</div>
          <div className="text-xs text-muted-foreground">YoY Growth</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-card">
          <div className="text-lg font-semibold text-success">{company.rating || 'N/A'}</div>
          <div className="text-xs text-muted-foreground">Glassdoor Rating</div>
        </div>
      </div>

      {/* Culture Metrics */}
      <div className="mb-6">
        <h5 className="font-medium text-foreground mb-3">Company Culture</h5>
        <div className="space-y-3">
          {cultureMetrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name={metric.icon} size={16} className="text-muted-foreground" />
                <span className="text-sm text-foreground">{metric.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {renderStars(metric.score)}
                </div>
                <span className={`text-sm font-medium ${getScoreColor(metric.score)}`}>
                  {metric.score.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Photos */}
      {company.teamPhotos && company.teamPhotos.length > 0 && (
        <div className="mb-6">
          <h5 className="font-medium text-foreground mb-3">Meet the Team</h5>
          <div className="flex items-center space-x-3">
            {company.teamPhotos.map((photo, index) => (
              <div key={index} className="relative">
                <Image
                  src={photo}
                  alt={`Team member ${index + 1}`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-background"
                />
              </div>
            ))}
            {company.totalEmployees && (
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">+{company.totalEmployees - company.teamPhotos.length}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Company Links */}
      <div className="flex items-center space-x-4 pt-4 border-t border-glass-border">
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Icon name="ExternalLink" size={14} />
            <span>Website</span>
          </a>
        )}
        {company.linkedin && (
          <a
            href={company.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Icon name="Linkedin" size={14} />
            <span>LinkedIn</span>
          </a>
        )}
        {company.careers && (
          <a
            href={company.careers}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Icon name="Briefcase" size={14} />
            <span>All Jobs</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default CompanyProfile;
