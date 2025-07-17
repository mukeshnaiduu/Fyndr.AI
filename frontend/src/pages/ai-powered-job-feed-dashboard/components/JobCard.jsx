import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const JobCard = ({ job, onBookmark, onApply }) => {
  const [isBookmarked, setIsBookmarked] = useState(job.isBookmarked || false);
  const [isApplying, setIsApplying] = useState(false);

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
                  <Image
                    src={job.company.logo}
                    alt={`${job.company.name} logo`}
                    className="w-full h-full object-cover"
                  />
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

            {/* Location and Type */}
            <div className="flex items-center space-x-4 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Icon name="MapPin" size={14} />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Clock" size={14} />
                <span>{job.type}</span>
              </div>
            </div>

            {/* Salary */}
            <div className="mb-4">
              <p className="text-foreground font-medium">
                ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                <span className="text-muted-foreground text-sm ml-1">/ year</span>
              </p>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {job.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-card"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills.length > 3 && (
                  <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-card">
                    +{job.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>

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
                  <p className="text-xs text-muted-foreground">AI Match</p>
                  <p className={`text-sm font-medium ${getMatchColor(job.matchPercentage)}`}>
                    {job.matchPercentage >= 90 ? 'Excellent' : 
                     job.matchPercentage >= 70 ? 'Good' : 
                     job.matchPercentage >= 50 ? 'Fair' : 'Low'}
                  </p>
                </div>
              </div>

              {/* Apply Button */}
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
            </div>

            {/* Posted Time */}
            <div className="mt-4 pt-4 border-t border-glass-border">
              <p className="text-xs text-muted-foreground">
                Posted {job.postedTime}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default JobCard;
