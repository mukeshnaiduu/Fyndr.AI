import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import JobCard from './JobCard';

const SavedJobsSection = ({ savedJobs, onRemoveFromSaved, onApply, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (savedJobs.length === 0) {
    return (
      <div className="glassmorphic-card p-8 text-center">
        <Icon name="Heart" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Saved Jobs</h3>
        <p className="text-muted-foreground">
          Save jobs you're interested in to easily find them later
        </p>
      </div>
    );
  }

  const displayedJobs = isExpanded ? savedJobs : savedJobs.slice(0, 3);

  return (
    <div className="glassmorphic-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="Heart" size={24} className="text-error" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Saved Jobs</h2>
            <p className="text-sm text-muted-foreground">
              {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>
        
        {savedJobs.length > 3 && (
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            {isExpanded ? 'Show Less' : `Show All (${savedJobs.length})`}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayedJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onSave={onRemoveFromSaved}
            onApply={onApply}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {savedJobs.length > 3 && !isExpanded && (
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(true)}
            iconName="ChevronDown"
            iconPosition="right"
          >
            View {savedJobs.length - 3} more saved jobs
          </Button>
        </div>
      )}
    </div>
  );
};

export default SavedJobsSection;
