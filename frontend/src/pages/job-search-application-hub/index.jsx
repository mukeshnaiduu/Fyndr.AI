import React, { useState, useEffect } from 'react';

import MainLayout from 'components/layout/MainLayout'
import SidebarLayout from 'components/layout/SidebarLayout';
import SearchBar from './components/SearchBar';
import FilterChips from './components/FilterChips';
import JobCard from './components/JobCard';
// import FilterSidebar from './components/FilterSidebar';
import SortDropdown from './components/SortDropdown';
import JobDetailModal from './components/JobDetailModal';
import SavedJobsSection from './components/SavedJobsSection';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import { useJobs, useJobStats, useFilterOptions } from '../../hooks/useJobs';

const JobSearchApplicationHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [currentView, setCurrentView] = useState('search'); // 'search' or 'saved'
  const [savedJobs, setSavedJobs] = useState([]);

  // Use real data hooks
  const {
    jobs,
    loading,
    error,
    hasMore,
    totalCount,
    filters,
    loadMore,
    updateFilters,
    refresh
  } = useJobs({ country: 'india' }); // Start with India jobs

  const { stats } = useJobStats({ country: 'india' });
  const { filterOptions } = useFilterOptions({ country: 'india' });

  // Initialize saved jobs from localStorage
  useEffect(() => {
    const savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setSavedJobs(jobs.filter(job => savedJobIds.includes(job.id)));
  }, [jobs]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    updateFilters({ 
      ...filters,
      search: query,
      location: location 
    });
  };
  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    updateFilters({ 
      ...filters,
      location: newLocation 
    });
  };

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  const handleApplyFilters = (newFilters) => {
    updateFilters(newFilters);
    setIsFilterSidebarOpen(false);
  };

  const handleClearFilters = () => {
    updateFilters({});
  };

  const handleRemoveFilter = (filterKey) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    updateFilters(newFilters);
  };

  const handleClearAllFilters = () => {
    updateFilters({});
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    let ordering = '';
    switch (newSort) {
      case 'date':
        ordering = '-date_posted';
        break;
      case 'relevance':
        ordering = '-date_scraped';
        break;
      case 'company':
        ordering = 'company';
        break;
      default:
        ordering = '-date_posted';
    }
    updateFilters({ ...filters, ordering });
  };

  const handleJobSave = (jobId, saved) => {
    // Update localStorage for saved jobs
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
    
    // Update local saved jobs state
    if (saved) {
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        setSavedJobs(prev => [...prev, { ...job, isSaved: true }]);
      }
    } else {
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    }
  };

  const handleJobApply = async (jobId) => {
    // Simulate API call - in real app, this would make an API request
    // For now, just track in localStorage
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    if (!appliedJobs.includes(jobId)) {
      appliedJobs.push(jobId);
      localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
    }
  };

  const handleViewJobDetails = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    setSelectedJob(job);
    setIsJobDetailOpen(true);
  };

  const handleCloseJobDetail = () => {
    setIsJobDetailOpen(false);
    setSelectedJob(null);
  };

  const handleRemoveFromSaved = (jobId) => {
    handleJobSave(jobId, false);
  };

  // Simple sorting logic for display (API handles main filtering)
  const sortedJobs = [...jobs].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.postedDate) - new Date(a.postedDate);
      case 'relevance':
        return (b.matchPercentage || 0) - (a.matchPercentage || 0);
      case 'company':
        return a.company.name.localeCompare(b.company.name);
      default:
        return new Date(b.postedDate) - new Date(a.postedDate);
    }
  });

  // Display stats
  const displayStats = stats || { total_jobs: jobs.length };

  return (
    <MainLayout
      title="Job Search & Application Hub"
      description="Discover and apply for jobs with AI-powered matching and comprehensive search capabilities"
      noPadding
    >
      <SidebarLayout className="!border-l-0">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-background min-h-screen">
          <div className="grid grid-cols-1 gap-6">
            {/* Search Section */}
            <div className="mb-6">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  Find Your Dream Job
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Discover opportunities that match your skills with AI-powered job recommendations
                </p>
              </div>

              <SearchBar
                onSearch={handleSearch}
                onLocationChange={handleLocationChange}
                searchQuery={searchQuery}
                location={location}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1 glassmorphic-surface rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('search')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${currentView === 'search' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-white/10'
                    }`}
                >
                  <Icon name="Search" size={16} />
                  <span>Search Jobs</span>
                </button>
                <button
                  onClick={() => setCurrentView('saved')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${currentView === 'saved' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-white/10'
                    }`}
                >
                  <Icon name="Heart" size={16} />
                  <span>Saved Jobs</span>
                  {savedJobs.length > 0 && (
                    <span className="bg-error text-error-foreground text-xs rounded-full px-2 py-0.5">
                      {savedJobs.length}
                    </span>
                  )}
                </button>
              </div>

              {currentView === 'search' && (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterSidebarOpen(true)}
                    iconName="Filter"
                    iconPosition="left"
                    className="lg:hidden"
                  >
                    Filters
                  </Button>

                  <SortDropdown
                    currentSort={sortBy}
                    onSortChange={handleSortChange}
                  />
                </div>
              )}
            </div>

            {/* Active Filters */}
            {currentView === 'search' && Object.keys(filters).length > 0 && (
              <div className="mb-6">
                <FilterChips
                  activeFilters={filters}
                  onRemoveFilter={handleRemoveFilter}
                  onClearAll={handleClearAllFilters}
                />
              </div>
            )}

            {/* Content */}
            {currentView === 'search' ? (
              <div className="bg-card rounded-xl shadow p-6">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-semibold text-foreground">
                      {totalCount} Job{totalCount !== 1 ? 's' : ''} Found in India
                    </h2>
                    {searchQuery && (
                      <span className="text-muted-foreground">
                        for "{searchQuery}"
                      </span>
                    )}
                    {error && (
                      <span className="text-error text-sm">
                        Error loading jobs: {error}
                      </span>
                    )}
                  </div>
                </div>

                {/* Job Grid */}
                {loading ? (
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
                ) : sortedJobs.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedJobs.map((job) => (
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
                      Try adjusting your search criteria or filters to find more opportunities
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      iconName="RotateCcw"
                      iconPosition="left"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}

                {/* Load More */}
                {sortedJobs.length > 0 && hasMore && !loading && (
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
              </div>
            ) : (
              <div className="bg-card rounded-xl shadow p-6">
                <SavedJobsSection
                  savedJobs={savedJobs}
                  onRemoveFromSaved={handleRemoveFromSaved}
                  onApply={handleJobApply}
                  onViewDetails={handleViewJobDetails}
                />
              </div>
            )}
          </div>
        </div>

        {/* Job Detail Modal */}
        <JobDetailModal
          job={selectedJob}
          isOpen={isJobDetailOpen}
          onClose={handleCloseJobDetail}
          onApply={handleJobApply}
          onSave={handleJobSave}
        />
      </SidebarLayout>
    </MainLayout>
  );
};

export default JobSearchApplicationHub;

