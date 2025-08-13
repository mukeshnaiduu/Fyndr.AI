import React, { useState, useEffect } from 'react';
import MainLayout from 'components/layout/MainLayout';
import SidebarLayout from 'components/layout/SidebarLayout';
import JobCard from './components/JobCard';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import jobsAPI from '../../services/jobsAPI';

const JobSearchApplicationHub = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (append = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await jobsAPI.fetchJobs({
        country: 'india',
        page: append ? currentPage + 1 : 1,
        pageSize: 20
      });

      const transformedJobs = response.results.map(job => jobsAPI.transformJobData(job));

      if (append) {
        setJobs(prev => [...prev, ...transformedJobs]);
        setCurrentPage(prev => prev + 1);
      } else {
        setJobs(transformedJobs);
        setCurrentPage(1);
      }

      setTotalCount(response.count);
      setHasMore(!!response.next);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchJobs(true);
    }
  };

  const handleJobSave = (jobId, saved) => {
    // Save to localStorage
    const savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    if (saved) {
      if (!savedJobIds.includes(jobId)) {
        savedJobIds.push(jobId);
      }
    } else {
      const index = savedJobIds.indexOf(jobId);
      if (index > -1) {
        savedJobIds.splice(index, 1);
      }
    }
    localStorage.setItem('savedJobs', JSON.stringify(savedJobIds));
  };

  const handleJobApply = async (jobId) => {
    // Track applied jobs in localStorage
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    if (!appliedJobs.includes(jobId)) {
      appliedJobs.push(jobId);
      localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
    }
  };

  const handleViewJobDetails = (jobId) => {
    // Navigate to job detail view with the job ID
    window.location.href = `/job-detail-view?id=${jobId}`;
  };

  if (error) {
    return (
      <MainLayout title="Job Search - Error">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Jobs</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchJobs()}>Try Again</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="India Jobs - Fyndr.AI"
      description="Browse available jobs in India"
      noPadding
    >
      <SidebarLayout className="!border-l-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-background min-h-screen">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Jobs in India
              </h1>
              <p className="text-lg text-muted-foreground">
                {totalCount} opportunities available across India
              </p>
            </div>

            {/* Content */}
            <div className="bg-card rounded-xl shadow p-6">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {totalCount} Jobs Found
                </h2>
              </div>

              {/* Job Grid */}
              {loading && jobs.length === 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-muted p-6 rounded-xl shadow animate-pulse">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-card rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-card rounded mb-2"></div>
                          <div className="h-3 bg-card rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-card rounded"></div>
                        <div className="h-3 bg-card rounded w-3/4"></div>
                        <div className="h-3 bg-card rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : jobs.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSave={handleJobSave}
                      onApply={handleJobApply}
                      onViewDetails={handleViewJobDetails}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-muted p-12 rounded-xl shadow text-center">
                  <Icon name="Search" size={64} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Jobs Found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find any jobs matching your criteria.
                  </p>
                </div>
              )}

              {/* Load More */}
              {jobs.length > 0 && hasMore && !loading && (
                <div className="text-center mt-8">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    iconName="ChevronDown"
                    iconPosition="right"
                  >
                    Load More Jobs
                  </Button>
                </div>
              )}

              {/* Loading more indicator */}
              {loading && jobs.length > 0 && (
                <div className="text-center mt-8">
                  <div className="inline-flex items-center space-x-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Loading more jobs...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarLayout>
    </MainLayout>
  );
};

export default JobSearchApplicationHub;
