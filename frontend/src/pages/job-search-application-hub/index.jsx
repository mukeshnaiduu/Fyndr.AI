import React, { useState, useEffect, useCallback, useMemo } from 'react';

import MainLayout from 'components/layout/MainLayout'
import SidebarLayout from 'components/layout/SidebarLayout';
import SearchBar from './components/SearchBar';
import FilterChips from './components/FilterChips';
import JobCard from './components/JobCard';
// import FilterSidebar from './components/FilterSidebar';
import SortDropdown from './components/SortDropdown';
import JobDetailModal from './components/JobDetailModal';
import QuickApplyModal from 'components/QuickApplyModal';
import SavedJobsSection from './components/SavedJobsSection';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import { useJobs, useJobStats, useFilterOptions } from '../../hooks/useJobs';
import { clearInvalidTokens } from '../../utils/auth';

// Dynamic imports for real-time features
import { useRealTimeConnection, useRealTimeJobMatching, useRealTimeApplications } from "../../services/hooks/useRealTime";
import jobApplicationService from "../../services/jobApplicationService";
import dynamicAPI from "../../services/dynamicAPI";
import realTimeService from "../../services/realTimeService";
import { useApplications } from "../../hooks/useApplications";
import showToast from 'utils/showToast';
import { apiRequest } from '../../utils/api';

const JobSearchApplicationHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [currentView, setCurrentView] = useState('search'); // 'search' or 'saved'
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const { quickApply } = useApplications();

  // Real-time features state
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [jobScores, setJobScores] = useState({});
  const [liveJobUpdates, setLiveJobUpdates] = useState([]);
  const [quickApplyJob, setQuickApplyJob] = useState(null);
  const [quickApplyOpen, setQuickApplyOpen] = useState(false);
  const [dynamicInsights, setDynamicInsights] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState({
    activeJobs: 0,
    newJobs: 0,
    matchingJobs: 0,
    totalViews: 0
  });

  // Dynamic hooks
  const { isConnected } = useRealTimeConnection();
  const {
    matches,
    startMatching,
    stopMatching
  } = useRealTimeJobMatching();

  const { applyDynamically } = useRealTimeApplications();

  // Define static filter objects to prevent infinite re-renders
  const indiaFilters = useMemo(() => ({ country: 'india' }), []);

  // Use real data hooks with static filter reference
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
  } = useJobs(indiaFilters); // Start with India jobs

  const { stats } = useJobStats(indiaFilters);
  const { filterOptions } = useFilterOptions(indiaFilters);

  // On mount, quickly verify backend DB health to surface environment issues early
  useEffect(() => {
    (async () => {
      try {
        const health = await apiRequest('/applications/health/');
        const ok = !!health?.ok;
        const hasApps = !!health?.tables?.jobapplier_application;
        const hasJobs = !!health?.tables?.jobscraper_jobposting;
        if (!ok || !hasApps || !hasJobs) {
          showToast('Backend DB not migrated or tables missing. Please run migrations on the active backend.', 'warning');
        }
      } catch (e) {
        // Non-blocking; just surface a helpful hint
        showToast('Backend health check failed. Ensure the API target is reachable and migrated.', 'error');
      }
    })();
  }, []);

  // Initialize saved jobs from localStorage
  useEffect(() => {
    const savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setSavedJobs(jobs.filter(job => savedJobIds.includes(job.id)));
  }, [jobs]);

  // Initialize applied jobs from localStorage
  useEffect(() => {
    const appliedJobIds = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    setAppliedJobs(new Set(appliedJobIds));
  }, []);

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
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        showToast('Please log in to apply for jobs', 'warning');
        return;
      }

      // Redirect-first for consistency
      const job = jobs.find(j => j.id === jobId) || { id: jobId };
      const result = await jobApplicationService.redirectAndRecord(job, { notes: 'User redirected from job hub' });

      showToast(result.already_applied
        ? 'You already applied to this job. Showing your existing application.'
        : 'Opened careers site and recorded your application.', 'success');

      // Update local state to track applied jobs
      const updatedAppliedJobs = new Set(appliedJobs);
      updatedAppliedJobs.add(jobId);
      setAppliedJobs(updatedAppliedJobs);

      const appliedJobsArray = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      if (!appliedJobsArray.includes(jobId)) {
        appliedJobsArray.push(jobId);
        localStorage.setItem('appliedJobs', JSON.stringify(appliedJobsArray));
      }

    } catch (error) {
      console.error('Error applying to job:', error);

      showToast(error.message || 'Failed to apply for job', 'error');
    }
  };

  const handleViewJobDetails = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    setSelectedJob(job);
    setIsJobDetailOpen(true);
  };

  const handleQuickApply = async (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (job?.application_mode === 'quick' || job?.source_type === 'recruiter') {
      setQuickApplyJob(job);
      setQuickApplyOpen(true);
      return;
    }
    try {
      const res = await quickApply(jobId, 'dynamic');
      showToast(res?.message || 'Attempted Quick Apply (Beta).', 'success');
    } catch (e) {
      showToast(e?.message || 'Quick Apply failed.', 'error');
    }
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

  // Real-time mode toggle
  const handleRealTimeModeToggle = useCallback(async () => {
    if (!userProfile) {
      // Mock user profile for demo
      const mockProfile = {
        skills: ['React', 'JavaScript', 'Node.js', 'Python', 'TypeScript'],
        experience_level: 'senior',
        preferred_locations: ['Bengaluru', 'Remote', 'Mumbai'],
        salary_expectations: { min: 2000000, max: 3000000 }
      };
      setUserProfile(mockProfile);
    }

    if (realTimeMode) {
      // Stop real-time matching
      await stopMatching();
      setRealTimeMode(false);
      console.log('🛑 Real-time job matching disabled');
    } else {
      // Start real-time matching
      setRealTimeMode(true);
      console.log('🚀 Real-time job matching enabled');
    }
  }, [realTimeMode, userProfile, stopMatching]);

  // Real-time job matching updates
  useEffect(() => {
    if (matches.length > 0 && realTimeMode) {
      console.log('📈 Received real-time job matches:', matches);

      // Update job scores with real-time data
      const updatedScores = {};
      matches.forEach(match => {
        updatedScores[match.job_id] = {
          score: match.match_score,
          percentage: Math.round((match.match_score || 0) * 100),
          lastUpdate: new Date().toISOString(),
          isRealTime: true
        };
      });

      setJobScores(updatedScores);

      // Update live job updates feed
      const newUpdates = matches.map(match => ({
        id: `match-${match.job_id}-${Date.now()}`,
        type: 'match',
        jobId: match.job_id,
        message: `New ${Math.round((match.match_score || 0) * 100)}% match found`,
        timestamp: new Date().toISOString()
      }));

      setLiveJobUpdates(prev => [...newUpdates, ...prev].slice(0, 10));

      // Update real-time stats
      setRealTimeStats(prev => ({
        ...prev,
        matchingJobs: matches.length,
        newJobs: prev.newJobs + newUpdates.length
      }));
    }
  }, [matches, realTimeMode]);

  // Real-time insights and analytics
  useEffect(() => {
    if (realTimeMode && jobs.length > 0) {
      const insights = {
        topSkills: jobs.reduce((acc, job) => {
          if (job.skills) {
            job.skills.forEach(skill => {
              acc[skill] = (acc[skill] || 0) + 1;
            });
          }
          return acc;
        }, {}),
        salaryTrends: {
          average: jobs.reduce((sum, job) => {
            const salary = job.salary?.min || 0;
            return sum + salary;
          }, 0) / jobs.length,
          range: {
            min: Math.min(...jobs.map(job => job.salary?.min || 0)),
            max: Math.max(...jobs.map(job => job.salary?.max || 0))
          }
        },
        locationDistribution: jobs.reduce((acc, job) => {
          const location = job.location || 'Unknown';
          acc[location] = (acc[location] || 0) + 1;
          return acc;
        }, {}),
        companyTypes: jobs.reduce((acc, job) => {
          const type = job.company?.size || 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      };

      setDynamicInsights(insights);
    }
  }, [realTimeMode, jobs]);

  // Initialize user profile on mount
  useEffect(() => {
    // Clear any invalid tokens first
    clearInvalidTokens();

    const mockProfile = {
      id: 1,
      skills: ['React', 'JavaScript', 'Node.js', 'Python', 'TypeScript'],
      experience_level: 'senior',
      preferred_locations: ['Bengaluru', 'Remote', 'Mumbai'],
      salary_expectations: { min: 2000000, max: 3000000 },
      job_preferences: {
        employment_types: ['Full-time'],
        remote_work: true,
        company_size: ['startup', 'medium']
      }
    };
    setUserProfile(mockProfile);
  }, []);

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

              {/* Real-time controls and insights */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <button
                  onClick={handleRealTimeModeToggle}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${realTimeMode
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {realTimeMode ? '⚡ Live Matching' : '🔄 Enable Live Matching'}
                </button>

                {realTimeMode && (
                  <div className="flex items-center space-x-4 text-sm">
                    {matches.length > 0 && (
                      <div className="text-green-600 font-medium">
                        {matches.length} live matches
                      </div>
                    )}
                    <div className="text-blue-600">
                      {realTimeStats.newJobs} new jobs
                    </div>
                    <div className="text-purple-600">
                      {realTimeStats.matchingJobs} matches
                    </div>
                  </div>
                )}
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

            {/* Real-time insights panel */}
            {realTimeMode && dynamicInsights && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h3 className="text-lg font-semibold text-green-700">Live Market Insights</h3>
                  </div>
                  <span className="text-sm text-green-600">
                    Updated {new Date().toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white/60 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Average Salary</h4>
                    <p className="text-2xl font-bold text-green-600">
                      ${Math.round(dynamicInsights.salaryTrends.average).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white/60 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Top Skill</h4>
                    <p className="text-lg font-semibold text-blue-600">
                      {Object.keys(dynamicInsights.topSkills).sort((a, b) =>
                        dynamicInsights.topSkills[b] - dynamicInsights.topSkills[a]
                      )[0] || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-white/60 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Active Jobs</h4>
                    <p className="text-2xl font-bold text-purple-600">{jobs.length}</p>
                  </div>

                  <div className="bg-white/60 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Match Rate</h4>
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.round((realTimeStats.matchingJobs / Math.max(jobs.length, 1)) * 100)}%
                    </p>
                  </div>
                </div>

                {/* Live updates feed */}
                {liveJobUpdates.length > 0 && (
                  <div className="mt-4 bg-white/60 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Live Updates</h4>
                    <div className="space-y-2 max-h-24 overflow-y-auto">
                      {liveJobUpdates.slice(0, 3).map(update => (
                        <div key={update.id} className="text-sm text-gray-600 flex items-center space-x-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>{update.message}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(update.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2">
                      {error.includes('Authentication') ? (
                        <div className="bg-warning/10 border border-warning/20 rounded-lg px-3 py-2">
                          <span className="text-warning text-sm">
                            ⚠️ {error}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                          <span className="text-error text-sm">
                            ❌ Error: {error}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
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
                    {sortedJobs.map((job) => {
                      const jobScore = jobScores[job.id];
                      const enhancedJob = {
                        ...job,
                        applicationStatus: appliedJobs.has(job.id) ? 'applied' : 'not-applied',
                        isRealTime: realTimeMode && jobScore?.isRealTime,
                        matchPercentage: jobScore?.percentage || job.matchPercentage || Math.floor(Math.random() * 40) + 60,
                        lastRealTimeUpdate: jobScore?.lastUpdate,
                        // Add comprehensive job data if missing
                        description: job.description || 'Join our team and make an impact in a dynamic environment with opportunities for growth and development.',
                        skills: job.skills || ['Communication', 'Problem Solving', 'Teamwork'],
                        requirements: job.requirements || [
                          'Bachelor\'s degree or equivalent experience',
                          '2+ years of relevant experience',
                          'Strong analytical skills'
                        ],
                        benefits: job.benefits || ['Health Insurance', 'PTO', '401k'],
                        workEnvironment: job.workEnvironment || 'Collaborative team environment with flexible work arrangements',
                        applicationDeadline: job.applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        company: {
                          ...job.company,
                          size: job.company?.size || 'Medium',
                          logo: job.company?.logo || '/placeholder-logo.png'
                        },
                        salary: {
                          ...job.salary,
                          type: job.salary?.type || 'annual'
                        }
                      };

                      return (
                        <JobCard
                          key={job.id}
                          job={enhancedJob}
                          onSave={handleJobSave}
                          onApply={handleJobApply}
                          onQuickApply={handleQuickApply}
                          onViewDetails={handleViewJobDetails}
                        />
                      );
                    })}
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
          onQuickApply={handleQuickApply}
          onSave={handleJobSave}
        />
      </SidebarLayout>
      {/* Quick Apply Modal */}
      <QuickApplyModal
        isOpen={quickApplyOpen}
        job={quickApplyJob}
        onClose={() => setQuickApplyOpen(false)}
        onSuccess={() => {
          const msg = document.createElement('div');
          msg.className = 'fixed top-20 right-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50';
          msg.textContent = 'Application submitted';
          document.body.appendChild(msg);
          setTimeout(() => document.body.removeChild(msg), 3000);
        }}
      />
    </MainLayout>
  );
};

export default JobSearchApplicationHub;

