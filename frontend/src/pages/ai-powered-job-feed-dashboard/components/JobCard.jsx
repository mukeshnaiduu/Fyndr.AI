import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const JobCard = ({ job, onBookmark, onApply, onQuickApply }) => {
  const [isBookmarked, setIsBookmarked] = useState(job.isBookmarked || false);
  const [isApplying, setIsApplying] = useState(false);
  const [isQuickApplying, setIsQuickApplying] = useState(false);

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark(job.id, !isBookmarked);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsApplying(true);
    await onApply(job.id);
    setIsApplying(false);
  };

  const handleQuickApply = async (e) => {
    if (!onQuickApply) return;
    e.preventDefault();
    e.stopPropagation();
    setIsQuickApplying(true);
    try {
      await onQuickApply(job.id);
    } finally {
      setIsQuickApplying(false);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 70) return 'text-primary';
    if (percentage >= 50) return 'text-warning';
    return 'text-error';
  };

  const getMatchGradient = (percentage) => {
    if (percentage >= 90) return 'from-success to-accent';
    if (percentage >= 70) return 'from-primary to-secondary';
    if (percentage >= 50) return 'from-warning to-primary';
    return 'from-error to-warning';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link to={`/job-detail-view?id=${job.id}`}>
        <div className="glass-card p-6 hover-lift transition-all duration-300 relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-soft opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-card overflow-hidden bg-muted flex-shrink-0">
                  {job.company.logo ? (
                    <Image
                      src={job.company.logo}
                      alt={`${job.company.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xs font-medium">
                        {job.company.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading font-semibold text-foreground text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-1">
                    {job.company.name}
                  </p>
                </div>
              </div>

              {/* Bookmark Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBookmark}
                className="flex-shrink-0 hover:bg-white/20"
              >
                <Icon
                  name={isBookmarked ? "BookmarkCheck" : "Bookmark"}
                  size={18}
                  className={isBookmarked ? "text-primary" : "text-muted-foreground"}
                />
              </Button>
            </div>

            {/* Location, Type and Mode */}
            <div className="flex items-center flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
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
              {job.employment_mode && (
                <div className="flex items-center space-x-1">
                  <Icon name="Home" size={14} />
                  <span className="capitalize">{job.employment_mode}</span>
                </div>
              )}
              {job.experience_level && (
                <div className="flex items-center space-x-1">
                  <Icon name="TrendingUp" size={14} />
                  <span className="capitalize">{job.experience_level}</span>
                </div>
              )}
            </div>

            {/* Salary */}
            <div className="mb-4">
              <p className="text-foreground font-medium">
                {job.salary?.min && job.salary?.max
                  ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                  : job.salary?.text || (typeof job.salary === 'string' ? job.salary : 'Salary not disclosed')
                }
                {job.salary?.min && job.salary?.max && (
                  <span className="text-muted-foreground text-sm ml-1">/ year</span>
                )}
              </p>
            </div>

            {/* Skills */}
            {Array.isArray(job.skills || job.skills_required) && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {(job.skills || job.skills_required).slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-card"
                    >
                      {skill}
                    </span>
                  ))}
                  {(job.skills || job.skills_required).length > 5 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-card">
                      +{(job.skills || job.skills_required).length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Match Percentage and Actions */}
            <div className="flex items-center justify-between">
              {/* AI Match Percentage */}
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted opacity-20"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeWidth="2"
                      strokeDasharray={`${job.matchPercentage}, 100`}
                      className={`bg-gradient-${getMatchGradient(job.matchPercentage)} bg-clip-text text-transparent`}
                      style={{
                        stroke: job.matchPercentage >= 90 ? '#10B981' : 
                               job.matchPercentage >= 70 ? '#8B5CF6' : 
                               job.matchPercentage >= 50 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-bold ${getMatchColor(job.matchPercentage)}`}>
                      {job.matchPercentage}%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <p className="text-xs text-muted-foreground">AI Match</p>
                    {job.isRealTime && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">LIVE</span>
                      </div>
                    )}
                  </div>
                  <p className={`text-sm font-medium ${getMatchColor(job.matchPercentage)}`}>
                    {job.matchPercentage >= 90 ? 'Excellent' : 
                     job.matchPercentage >= 70 ? 'Good' : 
                     job.matchPercentage >= 50 ? 'Fair' : 'Low'}
                  </p>
                  {job.lastScoreUpdate && (
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(job.lastScoreUpdate).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Apply Button */}
              {job.hasApplied ? (
                <Button
                  variant="success"
                  size="sm"
                  iconName="Check"
                  iconPosition="left"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled
                >
                  Applied
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    loading={isApplying}
                    onClick={handleApply}
                    iconName="Send"
                    iconPosition="left"
                    className="bg-gradient-primary hover:shadow-elevation-2"
                  >
                    Apply
                  </Button>
                  {onQuickApply && (
                    <Button
                      variant="outline"
                      size="sm"
                      loading={isQuickApplying}
                      onClick={handleQuickApply}
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
            </div>

            {/* Extras: Benefits, Deadline, Posted */}
            <div className="mt-4 pt-4 border-t border-glass-border space-y-2">
              {Array.isArray(job.benefits) && job.benefits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {job.benefits.slice(0, 3).map((b, i) => (
                    <span key={i} className="text-xs bg-green-500/10 text-green-700 px-2 py-0.5 rounded">
                      {b}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {job.application_deadline && (
                  <>
                    Deadline: {new Date(job.application_deadline).toLocaleDateString()} ·{' '}
                  </>
                )}
                {job.date_posted || job.postedDate ? (
                  <>Posted {new Date(job.date_posted || job.postedDate).toLocaleDateString()}</>
                ) : (
                  job.postedTime && <>Posted {job.postedTime}</>
                )}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default JobCard;
