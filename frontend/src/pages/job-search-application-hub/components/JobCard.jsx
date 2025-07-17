import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Image from 'components/AppImage';

const JobCard = ({ job, onSave, onApply, onViewDetails }) => {
  const [isSaved, setIsSaved] = useState(job.isSaved || false);
  const [isApplying, setIsApplying] = useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(job.id, !isSaved);
  };

  const handleApply = async () => {
    setIsApplying(true);
    await onApply(job.id);
    setIsApplying(false);
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 70) return 'text-accent';
    if (percentage >= 50) return 'text-warning';
    return 'text-error';
  };

  const getApplicationStatusColor = (status) => {
    const colors = {
      'not-applied': 'bg-muted text-muted-foreground',
      'applied': 'bg-primary/20 text-primary',
      'reviewing': 'bg-warning/20 text-warning',
      'interview': 'bg-accent/20 text-accent',
      'rejected': 'bg-error/20 text-error'
    };
    return colors[status] || colors['not-applied'];
  };

  const getApplicationStatusLabel = (status) => {
    const labels = {
      'not-applied': 'Not Applied',
      'applied': 'Applied',
      'reviewing': 'Under Review',
      'interview': 'Interview',
      'rejected': 'Rejected'
    };
    return labels[status] || 'Not Applied';
  };

  const formatSalary = (min, max) => {
    if (min && max) {
      return `$${min}K - $${max}K`;
    }
    if (min) {
      return `$${min}K+`;
    }
    return 'Salary not disclosed';
  };

  const formatPostedDate = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffTime = Math.abs(now - posted);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="glassmorphic-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
            <Image
              src={job.company.logo}
              alt={`${job.company.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors duration-200 truncate">
              {job.title}
            </h3>
            <p className="text-muted-foreground text-sm truncate">{job.company.name}</p>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSave();
          }}
          className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
            isSaved 
              ? 'text-error bg-error/20' :'text-muted-foreground hover:text-error hover:bg-error/10'
          }`}
        >
          <Icon name={isSaved ? "Heart" : "Heart"} size={20} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="MapPin" size={14} />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Clock" size={14} />
            <span>{job.type}</span>
          </div>
          {job.remote && (
            <div className="flex items-center space-x-1">
              <Icon name="Home" size={14} />
              <span>Remote</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-foreground">
            {formatSalary(job.salary.min, job.salary.max)}
          </div>
          <div className={`text-sm font-medium ${getMatchColor(job.matchPercentage)}`}>
            {job.matchPercentage}% match
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {job.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {job.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="px-2 py-1 bg-muted/20 text-muted-foreground text-xs rounded-full">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-muted-foreground">
            {formatPostedDate(job.postedDate)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${getApplicationStatusColor(job.applicationStatus)}`}>
            {getApplicationStatusLabel(job.applicationStatus)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(job.id);
            }}
            iconName="Eye"
            iconPosition="left"
          >
            View
          </Button>
          
          {job.applicationStatus === 'not-applied' && (
            <Button
              variant="default"
              size="sm"
              loading={isApplying}
              onClick={(e) => {
                e.stopPropagation();
                handleApply();
              }}
              iconName="Send"
              iconPosition="left"
            >
              Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
