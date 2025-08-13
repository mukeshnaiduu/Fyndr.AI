import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Image from 'components/AppImage';
import jobApplicationService from "../../../services/jobApplicationService";

const JobCard = ({ job, onSave, onApply, onQuickApply, onViewDetails }) => {
  const [isSaved, setIsSaved] = useState(job.isSaved || false);
  const [isApplying, setIsApplying] = useState(false);
  const [isQuickApplying, setIsQuickApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(job.applicationStatus || 'not-applied');
  const [applicationProgress, setApplicationProgress] = useState(null);
  const [confirmationNumber, setConfirmationNumber] = useState(job.confirmationNumber || null);

  // Listen for real-time status updates
  useEffect(() => {
    const handleStatusUpdate = (event) => {
      const { applicationId, status, details } = event.detail;

      // Update status if this job's application was updated
      if (job.applicationId && job.applicationId === applicationId) {
        setApplicationStatus(status);
        setIsApplying(false);

        if (details?.confirmation_number) {
          setConfirmationNumber(details.confirmation_number);
        }
      }
    };

    window.addEventListener('applicationStatusUpdate', handleStatusUpdate);

    return () => {
      window.removeEventListener('applicationStatusUpdate', handleStatusUpdate);
    };
  }, [job.applicationId]);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(job.id, !isSaved);
  };

  const handleApply = async () => {
    if (applicationStatus === 'applied' || applicationStatus === 'interview' || applicationStatus === 'offer') {
      return; // Already applied or progressed
    }

    setIsApplying(true);
    setApplicationProgress({ stage: 'starting', message: 'Initializing application...' });

    try {
      // Redirect-first approach: open external page (apply_url/url) and then record application as 'redirect'
      setApplicationProgress({ stage: 'processing', message: 'Opening careers site…' });
      const result = await jobApplicationService.redirectAndRecord(job, { notes: 'User redirected to careers site' });

      if (result.success) {
        setApplicationStatus('applied');
        setConfirmationNumber(result.confirmation_number);

        // Update job object with application info
        job.applicationId = result.application_id;
        job.applicationStatus = 'applied';

        setApplicationProgress({ stage: 'success', message: 'Opened careers site and recorded application.' });

        // Call parent handler
        if (onApply) {
          onApply(job.id, result);
        }

        // Clear progress after delay
        setTimeout(() => {
          setApplicationProgress(null);
        }, 3000);

      } else {
        throw new Error(result.error || 'Application failed');
      }

    } catch (error) {
      console.error('Application failed:', error);
      setApplicationProgress({ stage: 'error', message: error.message || 'Could not record application.' });

      // Clear error after delay
      setTimeout(() => {
        setApplicationProgress(null);
        setIsApplying(false);
      }, 5000);
    }
  };

  const handleQuickApply = async () => {
    if (!onQuickApply) return;
    setIsQuickApplying(true);
    try {
      await onQuickApply(job.id);
    } finally {
      setIsQuickApplying(false);
    }
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
            {job.company.logo ? (
              <Image
                src={job.company.logo}
                alt={`${job.company.name} logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <rect width="48" height="48" rx="8" fill="#f1f5f9"/>
                      <text x="24" y="28" text-anchor="middle" font-family="Inter, sans-serif" font-size="16" font-weight="600" fill="#64748b">
                        ${job.company.name.charAt(0).toUpperCase()}
                      </text>
                    </svg>
                  `)}`;
                }}
              />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center">
                <span className="text-white/60 text-sm font-medium">
                  {job.company.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
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
          className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${isSaved
              ? 'text-error bg-error/20' : 'text-muted-foreground hover:text-error hover:bg-error/10'
            }`}
        >
          <Icon name={isSaved ? "Heart" : "Heart"} size={20} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
          {job.location && (
            <div className="flex items-center space-x-1">
              <Icon name="MapPin" size={14} />
              <span>{job.location}</span>
            </div>
          )}
          {(job.type || job.job_type) && (
            <div className="flex items-center space-x-1">
              <Icon name="Clock" size={14} />
              <span>{job.type || job.job_type}</span>
            </div>
          )}
          {(job.employment_mode || job.workEnvironment || job.remote) && (
            <div className="flex items-center space-x-1">
              <Icon name="Home" size={14} />
              <span className="capitalize">{job.workEnvironment || job.employment_mode || (job.remote ? 'Remote' : '')}</span>
            </div>
          )}
          {job.experience_level && (
            <div className="flex items-center space-x-1">
              <Icon name="TrendingUp" size={14} />
              <span className="capitalize">{job.experience_level}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-foreground">
            {job.salary?.type === 'hourly'
              ? `$${job.salary.min}-${job.salary.max}/hr`
              : job.salary?.min
                ? `$${job.salary.min.toLocaleString()}-$${job.salary.max?.toLocaleString?.()}`
                : job.salary?.text
                || (typeof job.salary === 'string' ? job.salary : '')
                || job.salary_text
                || job.salary_range_display
                || job.compensation?.display
                || 'Salary not disclosed'
            }
          </div>
          <div className="flex items-center space-x-2">
            {job.isRealTime && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">LIVE</span>
              </div>
            )}
            <div className={`text-sm font-medium ${getMatchColor(job.matchPercentage || 0)}`}>
              {job.matchPercentage || 0}% match
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {job.description}
        </p>

        {/* Skills */}
        {(Array.isArray(job.skills) || Array.isArray(job.skills_required)) && (
          <div className="flex flex-wrap gap-1">
            {(job.skills || job.skills_required).slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
            {(job.skills || job.skills_required).length > 5 && (
              <span className="px-2 py-1 bg-muted/20 text-muted-foreground text-xs rounded-full">
                +{(job.skills || job.skills_required).length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Application Deadline */}
        {(job.applicationDeadline || job.application_deadline) && (
          <div className="flex items-center space-x-1 text-xs text-warning">
            <Icon name="Calendar" size={12} />
            <span>Deadline: {new Date(job.applicationDeadline || job.application_deadline).toLocaleDateString()}</span>
          </div>
        )}

        {/* Work Environment */}
        {(job.workEnvironment || job.employment_mode) && (
          <div className="text-xs text-muted-foreground bg-accent/10 px-2 py-1 rounded">
            <strong>Environment:</strong> {job.workEnvironment || job.employment_mode}
          </div>
        )}

        {/* Benefits Preview */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-muted-foreground">Benefits:</span>
            {job.benefits.slice(0, 2).map((benefit, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-500/10 text-green-600 text-xs rounded"
              >
                ✓ {benefit}
              </span>
            ))}
            {job.benefits.length > 2 && (
              <span className="px-2 py-1 bg-muted/20 text-muted-foreground text-xs rounded">
                +{job.benefits.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-muted-foreground">
            {formatPostedDate(job.postedDate || job.date_posted || job.posted_time)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${getApplicationStatusColor(applicationStatus)}`}>
            {getApplicationStatusLabel(applicationStatus)}
          </span>
          {confirmationNumber && (
            <span className="text-xs text-muted-foreground" title={`Confirmation: ${confirmationNumber}`}>
              #{confirmationNumber.slice(-6)}
            </span>
          )}
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

          {applicationStatus === 'not-applied' && (
            <div className="flex items-center gap-2">
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
                disabled={isApplying}
                className={job.isRealTime ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600' : ''}
              >
                Apply
              </Button>
              {onQuickApply && (
                <Button
                  variant="outline"
                  size="sm"
                  loading={isQuickApplying}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickApply();
                  }}
                  iconName="Zap"
                  iconPosition="left"
                  title="Quick Apply (Beta): may auto-fill and attempt automation on external forms"
                  className="border-dashed"
                >
                  Quick Apply (Beta)
                </Button>
              )}
            </div>
          )}

          {applicationStatus === 'applied' && (
            <Button
              variant="secondary"
              size="sm"
              iconName="CheckCircle"
              iconPosition="left"
              disabled
            >
              Applied
            </Button>
          )}
        </div>
      </div>

      {/* Real-time Progress Indicator */}
      {applicationProgress && (
        <div className="mt-4 p-3 rounded-lg bg-background/50 border border-border">
          <div className="flex items-center space-x-2">
            {applicationProgress.stage === 'starting' && (
              <Icon name="Clock" size={16} className="text-warning animate-pulse" />
            )}
            {applicationProgress.stage === 'processing' && (
              <Icon name="Loader" size={16} className="text-primary animate-spin" />
            )}
            {applicationProgress.stage === 'success' && (
              <Icon name="CheckCircle" size={16} className="text-success" />
            )}
            {applicationProgress.stage === 'error' && (
              <Icon name="XCircle" size={16} className="text-error" />
            )}
            <span className={`text-sm ${applicationProgress.stage === 'success' ? 'text-success' :
                applicationProgress.stage === 'error' ? 'text-error' :
                  'text-foreground'
              }`}>
              {applicationProgress.message}
            </span>
          </div>

          {applicationProgress.stage === 'processing' && (
            <div className="mt-2 w-full bg-muted rounded-full h-1">
              <div className="bg-primary h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobCard;
