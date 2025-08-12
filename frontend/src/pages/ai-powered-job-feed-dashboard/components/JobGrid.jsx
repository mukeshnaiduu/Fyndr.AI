import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JobCard from './JobCard';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const JobGrid = ({ 
  jobs, 
  loading, 
  hasMore, 
  onLoadMore, 
  onBookmark, 
  onApply,
  onQuickApply,
  showBookmarkedOnly = false 
}) => {
  const [displayedJobs, setDisplayedJobs] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const filteredJobs = showBookmarkedOnly 
      ? jobs.filter(job => job.isBookmarked)
      : jobs;
    setDisplayedJobs(filteredJobs);
  }, [jobs, showBookmarkedOnly]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    await onLoadMore();
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, onLoadMore]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading && displayedJobs.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="glass-card p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-muted rounded-card" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
              </div>
              <div className="w-6 h-6 bg-muted rounded" />
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="flex space-x-2">
                <div className="h-6 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayedJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
          <Icon name={showBookmarkedOnly ? "BookmarkX" : "Search"} size={32} color="white" />
        </div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
          {showBookmarkedOnly ? 'No Bookmarked Jobs' : 'No Jobs Found'}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {showBookmarkedOnly 
            ? 'You haven\'t bookmarked any jobs yet. Start exploring and save interesting opportunities!' :'We couldn\'t find any jobs matching your criteria. Try adjusting your filters or search terms.'
          }
        </p>
        {showBookmarkedOnly && (
          <Button variant="outline" onClick={() => window.location.reload()}>
            <Icon name="Search" size={16} className="mr-2" />
            Browse All Jobs
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {displayedJobs.map((job, index) => (
            <motion.div
              key={`${job.id}-${index}`}
              variants={itemVariants}
              layout
            >
              <JobCard
                job={job}
                onBookmark={onBookmark}
                onApply={onApply}
                onQuickApply={onQuickApply}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Load More Section */}
      {hasMore && (
        <div className="flex justify-center py-8">
          <Button
            variant="outline"
            loading={isLoadingMore}
            onClick={handleLoadMore}
            iconName="ChevronDown"
            iconPosition="right"
            className="px-8"
          >
            {isLoadingMore ? 'Loading more jobs...' : 'Load More Jobs'}
          </Button>
        </div>
      )}

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`loading-${index}`} className="glass-card p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-card" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-3 bg-muted rounded w-24" />
                  </div>
                </div>
                <div className="w-6 h-6 bg-muted rounded" />
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* End of Results */}
      {!hasMore && displayedJobs.length > 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-muted-foreground">
            <Icon name="CheckCircle" size={16} />
            <span className="text-sm">You've seen all available jobs</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobGrid;
