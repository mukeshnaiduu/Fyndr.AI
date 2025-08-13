import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const RelatedJobs = ({ jobs }) => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const formatSalary = (min, max) => {
    return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">
          Similar Opportunities
        </h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={scrollLeft}>
            <Icon name="ChevronLeft" size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={scrollRight}>
            <Icon name="ChevronRight" size={16} />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {jobs.map((job, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-80 glass-card p-4 border border-glass-border rounded-card hover-lift transition-all duration-300"
          >
            {/* Job Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-card flex items-center justify-center">
                  <Icon name="Building" size={16} color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm truncate">
                    {job.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {typeof job.company === 'string' ? job.company : job.company?.name || 'Company name not available'}
                  </p>
                </div>
              </div>
              <div className={`text-xs font-medium px-2 py-1 rounded ${job.matchPercentage >= 80
                  ? 'bg-success/10 text-success'
                  : job.matchPercentage >= 60
                    ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                }`}>
                {job.matchPercentage}%
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Icon name="MapPin" size={12} />
                <span className="truncate">{job.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Icon name="Clock" size={12} />
                <span>{job.type}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Icon name="DollarSign" size={12} />
                <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
              </div>
            </div>

            {/* Skills Preview */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {job.skills.slice(0, 3).map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills.length > 3 && (
                  <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                    +{job.skills.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Link
                to={`/job-detail-view?id=${job.id}`}
                className="flex-1"
              >
                <Button variant="outline" size="sm" fullWidth>
                  View Details
                </Button>
              </Link>
              <Button variant="ghost" size="icon">
                <Icon name="Bookmark" size={14} />
              </Button>
            </div>

            {/* Posted Time */}
            <div className="mt-3 pt-3 border-t border-glass-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Posted {job.postedTime}</span>
                <div className="flex items-center space-x-1">
                  <Icon name="Eye" size={12} />
                  <span>{job.views} views</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-4 text-center">
        <Link
          to="/ai-powered-job-feed-dashboard"
          className="inline-flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <span>View all similar jobs</span>
          <Icon name="ArrowRight" size={14} />
        </Link>
      </div>
    </div>
  );
};

export default RelatedJobs;
