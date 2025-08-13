import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import MainLayout from 'components/layout/MainLayout'
import SidebarLayout from 'components/layout/SidebarLayout';
import SearchHeader from 'components/ui/SearchHeader';
import Header from 'components/ui/Header';

import JobFeedFilters from './components/JobFeedFilters';
import JobFeedFilterSidebar from './components/JobFeedFilterSidebar';

import FilterChips from './components/FilterChips';
import SortDropdown from './components/SortDropdown';
import JobGrid from './components/JobGrid';
import AdvancedFilterPanel from './components/AdvancedFilterPanel';

import Button from 'components/ui/Button';
import { clearInvalidTokens } from '../../utils/auth';

// Import Dynamic Services
import {
  useRealTimeJobMatching,
  useDynamicApplications,
  useRealTimeConnection
} from '../../hooks/useRealTime';
import dynamicAPI from '../../services/dynamicAPI';
import realTimeService from '../../services/realTimeService';
import jobApplicationService from '../../services/jobApplicationService';

// Import JobsAPI service
import jobsAPI from '../../services/jobsAPI';
import { useApplications } from '../../hooks/useApplications';
import QuickApplyModal from 'components/QuickApplyModal';

const AIJobFeedDashboard = () => {
  // Applications hook for quick apply
  const { quickApply } = useApplications();
  const [quickApplyJob, setQuickApplyJob] = useState(null);
  const [quickApplyOpen, setQuickApplyOpen] = useState(false);

  // Original state
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentSort, setCurrentSort] = useState('relevance');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Real-time features state
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [jobScores, setJobScores] = useState(new Map());
  const [userProfile, setUserProfile] = useState(null);

  // Real-time hooks
  const { isConnected, connectionStatus } = useRealTimeConnection();
  const {
    isMatching,
    matches,
    startMatching,
    stopMatching,
    getLiveScores
  } = useRealTimeJobMatching(userProfile);
  const { applyDynamically, applications } = useDynamicApplications();

  const [activeFilters, setActiveFilters] = useState({
    location: [],
    salary: [],
    experience: [],
    jobType: []
  });

  const [advancedFilters, setAdvancedFilters] = useState({
    location: '',
    salaryRange: '',
    experienceLevel: '',
    jobTypes: [],
    workMode: '',
    companySize: '',
    skills: '',
    benefits: [],
    postedWithin: '',
    matchPercentage: 0
  });

  // State for handling API errors
  const [apiError, setApiError] = useState(null);

  // Use refs to prevent infinite re-renders
  const realTimeModeRef = useRef(realTimeMode);
  const userProfileRef = useRef(userProfile);
  const isInitialLoad = useRef(true);

  // Update refs when values change
  useEffect(() => {
    realTimeModeRef.current = realTimeMode;
  }, [realTimeMode]);

  useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);

  // Initialize jobs with real-time capabilities (stable function with no dependencies)
  const loadInitialJobs = useCallback(async () => {
    // Clear any invalid tokens first
    clearInvalidTokens();

    setLoading(true);
    try {
      if (realTimeModeRef.current && userProfileRef.current) {
        // Use real-time job matching
        console.log('🚀 Loading jobs with real-time matching...');
        await startMatching();

        // Get live scores for existing jobs
        const liveScores = await getLiveScores({
          page: 1,
          pageSize: 20,
          ordering: '-match_score'
        });

        if (liveScores?.results) {
          const transformedJobs = liveScores.results.map(job => ({
            id: job.job_id,
            title: job.title,
            company: {
              name: job.company || 'Company Name',
              logo: job.company_logo || null // No fallback static images
            },
            location: job.location || 'Location not specified',
            type: job.employment_type || 'Full-time',
            salary: {
              min: job.salary_min || 0,
              max: job.salary_max || 0
            },
            skills: job.skills ? job.skills.split(',').map(s => s.trim()) : [],
            matchPercentage: Math.round((job.match_score || 0) * 100),
            postedTime: job.date_posted || job.date_scraped || 'Recently',
            isBookmarked: false,
            description: job.description || 'No description available',
            realTimeScore: job.match_score,
            isRealTime: true
          }));
          setJobs(transformedJobs);
          setApiError(null); // Clear any previous errors
        }
      } else {
        // Fetch regular jobs from the backend
        const response = await jobsAPI.fetchJobs({
          page: 1,
          pageSize: 20,
          ordering: '-created_at' // Most recent first
        });

        // Transform backend data to match frontend format
        const transformedJobs = response.results?.map(job => ({
          id: job.job_id,
          title: job.title,
          company: {
            name: job.company || 'Company Name',
            logo: job.company_logo || null // No fallback static images
          },
          location: job.location || 'Location not specified',
          type: job.employment_type || 'Full-time',
          salary: {
            min: job.salary_min || 0,
            max: job.salary_max || 0
          },
          skills: job.skills ? job.skills.split(',').map(s => s.trim()) : [],
          matchPercentage: Math.floor(Math.random() * 30) + 70, // Simulate AI matching
          postedTime: job.date_posted || job.date_scraped || 'Recently',
          isBookmarked: false,
          description: job.description || 'No description available',
          url: job.url,
          apply_url: job.apply_url || job.application_url || null,
          source: job.source,
          source_type: job.source_type || null,
          application_mode: job.application_mode || null
        })) || [];

        setJobs(transformedJobs);
        setHasMore(response.next !== null);
        setApiError(null); // Clear any previous errors
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setApiError('Unable to load jobs. Please check your connection and try again.');
      setJobs([]); // Set empty array instead of mock data
    } finally {
      setLoading(false);
    }
  }, [startMatching, getLiveScores]);

  // Initial load effect (run only once on mount)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadInitialJobs();
    }
  }, []); // Empty dependencies - only run once

  // Reload when real-time mode or user profile changes
  useEffect(() => {
    if (!isInitialLoad.current) {
      // Add small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        loadInitialJobs();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [realTimeMode, userProfile]); // Only depend on the actual state values

  // Handle search
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    setLoading(true);

    try {
      // Search using real API
      const response = await jobsAPI.fetchJobs({
        search: query,
        page: 1,
        pageSize: 20,
        ordering: '-created_at'
      });

      // Transform backend data to match frontend format
      const transformedJobs = response.results?.map(job => ({
        id: job.job_id,
        title: job.title,
        company: {
          name: job.company || 'Company Name',
          logo: job.company_logo || null // No fallback static images
        },
        location: job.location || 'Location not specified',
        type: job.employment_type || 'Full-time',
        salary: {
          min: job.salary_min || 0,
          max: job.salary_max || 0
        },
        skills: job.skills ? job.skills.split(',').map(s => s.trim()) : [],
        matchPercentage: Math.floor(Math.random() * 30) + 70, // Simulate AI matching
        postedTime: job.date_posted || job.date_scraped || 'Recently',
        isBookmarked: false,
        description: job.description || 'No description available',
        url: job.url,
        apply_url: job.apply_url || job.application_url || null,
        source: job.source,
        source_type: job.source_type || null,
        application_mode: job.application_mode || null
      })) || [];

      setJobs(transformedJobs);
      setHasMore(response.next !== null);
      setApiError(null); // Clear any previous errors
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to client-side filtering of current jobs
      const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.name.toLowerCase().includes(query.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase()))
      );
      setJobs(filteredJobs);
    } finally {
      setLoading(false);
    }
  }, [jobs]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await jobsAPI.fetchJobs({
        page: 1,
        pageSize: 20,
        ordering: '-created_at'
      });

      const transformedJobs = response.results?.map(job => ({
        id: job.job_id,
        title: job.title,
        company: {
          name: job.company || 'Company Name',
          logo: job.company_logo || null // No fallback static images
        },
        location: job.location || 'Location not specified',
        type: job.employment_type || 'Full-time',
        salary: {
          min: job.salary_min || 0,
          max: job.salary_max || 0
        },
        skills: job.skills ? job.skills.split(',').map(s => s.trim()) : [],
        matchPercentage: Math.floor(Math.random() * 30) + 70,
        postedTime: job.date_posted || job.date_scraped || 'Recently',
        isBookmarked: false,
        description: job.description || 'No description available',
        url: job.url,
        apply_url: job.apply_url || job.application_url || null,
        source: job.source,
        source_type: job.source_type || null,
        application_mode: job.application_mode || null
      })) || [];

      setJobs(transformedJobs);
      setHasMore(response.next !== null);
    } catch (error) {
      console.error('Failed to refresh jobs:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback(async (filters) => {
    setActiveFilters(filters);
    setLoading(true);

    try {
      const params = {
        page: 1,
        pageSize: 20,
        ordering: '-created_at'
      };

      // Add location filter
      if (filters.location && filters.location.length > 0) {
        params.location = filters.location.join(',');
      }

      // Add employment type filter
      if (filters.jobType && filters.jobType.length > 0) {
        params.employment_type = filters.jobType.join(',');
      }

      const response = await jobsAPI.fetchJobs(params);

      const transformedJobs = response.results?.map(job => ({
        id: job.job_id,
        title: job.title,
        company: {
          name: job.company || 'Company Name',
          logo: job.company_logo || null // No fallback static images
        },
        location: job.location || 'Location not specified',
        type: job.employment_type || 'Full-time',
        salary: {
          min: job.salary_min || 0,
          max: job.salary_max || 0
        },
        skills: job.skills ? job.skills.split(',').map(s => s.trim()) : [],
        matchPercentage: Math.floor(Math.random() * 30) + 70,
        postedTime: job.date_posted || job.date_scraped || 'Recently',
        isBookmarked: false,
        description: job.description || 'No description available',
        url: job.url,
        apply_url: job.apply_url || job.application_url || null,
        source: job.source,
        source_type: job.source_type || null,
        application_mode: job.application_mode || null
      })) || [];

      setJobs(transformedJobs);
      setHasMore(response.next !== null);
    } catch (error) {
      console.error('Failed to apply filters:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((sortType) => {
    setCurrentSort(sortType);

    const sortedJobs = [...jobs].sort((a, b) => {
      switch (sortType) {
        case 'match':
          return b.matchPercentage - a.matchPercentage;
        case 'salary-high':
          return b.salary.max - a.salary.max;
        case 'salary-low':
          return a.salary.min - b.salary.min;
        case 'date':
          // Mock date sorting
          return Math.random() - 0.5;
        default:
          return 0;
      }
    });

    setJobs(sortedJobs);
  }, [jobs]);

  // Handle bookmark
  const handleBookmark = useCallback((jobId, isBookmarked) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, isBookmarked } : job
      )
    );
  }, []);

  // Handle apply with redirect-and-record processing
  const handleApply = useCallback(async (jobId) => {
    try {
      console.log(`🚀 Opening careers site and recording application for job ${jobId}...`);

      const job = jobs.find(j => j.id === jobId) || { id: jobId };
      const result = await jobApplicationService.redirectAndRecord(job, {
        notes: `Redirected from AI Job Feed Dashboard on ${new Date().toLocaleDateString()}`
      });

      // Update job in local state to show applied status
      setJobs(prevJobs =>
        prevJobs.map(j =>
          j.id === jobId ? { ...j, hasApplied: true, applicationId: result?.application_id || result?.application?.id } : j
        )
      );

      // Light inline confirmation prompt
      const didApply = window.confirm('Did you apply on the careers site? Click OK to mark as Applied.');
      if (didApply) {
        const appId = result?.application?.id || result?.application_id;
        if (appId) {
          const conf = prompt('Optional: enter confirmation number', '') || undefined;
          try {
            await jobApplicationService.confirmApplied(appId, { confirmationNumber: conf, applicationUrl: job?.url });
          } catch (_) { /* noop */ }
        }
      }
    } catch (error) {
      console.error('Application failed:', error);
      try { (await import('utils/showToast')).default(`Application failed: ${error.message}`, 'error'); } catch (_) { }
    }
  }, [jobs]);

  // Handle Quick Apply (Beta)
  const handleQuickApply = useCallback(async (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    // If job is recruiter quick-apply, open modal for file upload; otherwise use legacy quick apply
    if (job?.application_mode === 'quick' || job?.source_type === 'recruiter') {
      setQuickApplyJob(job);
      setQuickApplyOpen(true);
      return;
    }
    try {
      const res = await quickApply(jobId, 'dynamic');
      try { (await import('utils/showToast')).default(res?.message || 'Attempted Quick Apply (Beta). We will update the status if successful.', 'success'); } catch (_) { }
    } catch (e) {
      try { (await import('utils/showToast')).default(e?.message || 'Quick Apply failed.', 'error'); } catch (_) { }
    }
  }, [jobs, quickApply]);

  // Handle real-time mode toggle
  const handleRealTimeModeToggle = useCallback(async () => {
    if (!userProfileRef.current) {
      // Get user profile (in real app, this would come from auth context)
      const mockProfile = {
        skills: ['React', 'JavaScript', 'Node.js', 'Python'],
        experience_level: 'senior',
        preferred_locations: ['San Francisco', 'Remote'],
        salary_expectations: { min: 120000, max: 180000 }
      };
      setUserProfile(mockProfile);
    }

    if (realTimeModeRef.current) {
      // Stop real-time matching
      await stopMatching();
      setRealTimeMode(false);
      console.log('🛑 Real-time mode disabled');
    } else {
      // Start real-time matching
      setRealTimeMode(true);
      console.log('🚀 Real-time mode enabled');
    }
  }, [stopMatching]); // Only depend on stopMatching function

  // Real-time job score updates (with stable dependencies)
  useEffect(() => {
    if (matches.length > 0) {
      // Update jobs with real-time scores
      setJobs(prevJobs => {
        const updatedJobs = prevJobs.map(job => {
          const match = matches.find(m => m.job_id === job.id);
          if (match) {
            return {
              ...job,
              matchPercentage: Math.round((match.match_score || 0) * 100),
              realTimeScore: match.match_score,
              lastScoreUpdate: new Date().toISOString(),
              isRealTime: true
            };
          }
          return job;
        });

        // Sort by match score if real-time mode is active
        if (realTimeModeRef.current && currentSort === 'relevance') {
          return updatedJobs.sort((a, b) => (b.realTimeScore || 0) - (a.realTimeScore || 0));
        }

        return updatedJobs;
      });
    }
  }, [matches, currentSort]); // Remove realTimeMode dependency, use ref instead

  // Initialize user profile on mount
  useEffect(() => {
    // In a real app, this would come from authentication context
    const mockProfile = {
      id: 1,
      skills: ['React', 'JavaScript', 'Node.js', 'Python', 'TypeScript'],
      experience_level: 'senior',
      preferred_locations: ['San Francisco', 'Remote', 'New York'],
      salary_expectations: { min: 120000, max: 180000 },
      job_preferences: {
        employment_types: ['Full-time'],
        remote_work: true,
        company_size: ['startup', 'medium']
      }
    };
    setUserProfile(mockProfile);
  }, []);

  // Handle load more (use ref for jobs length to prevent dependency issues)
  const jobsLengthRef = useRef(0);

  useEffect(() => {
    jobsLengthRef.current = jobs.length;
  }, [jobs.length]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      // Calculate next page using ref to avoid dependency
      const nextPage = Math.floor(jobsLengthRef.current / 20) + 1;

      // Load more jobs from API
      const response = await jobsAPI.fetchJobs({
        page: nextPage,
        pageSize: 20,
        ordering: '-created_at',
        search: searchQuery
      });

      // Transform backend data to match frontend format
      const transformedJobs = response.results?.map(job => ({
        id: job.job_id,
        title: job.title,
        company: {
          name: job.company || 'Company Name',
          logo: job.company_logo || null // No fallback static images
        },
        location: job.location || 'Location not specified',
        type: job.employment_type || 'Full-time',
        salary: {
          min: job.salary_min || 0,
          max: job.salary_max || 0
        },
        skills: job.skills ? job.skills.split(',').map(s => s.trim()) : [],
        matchPercentage: Math.floor(Math.random() * 30) + 70,
        postedTime: job.date_posted || job.date_scraped || 'Recently',
        isBookmarked: false,
        description: job.description || 'No description available',
        url: job.url,
        source: job.source
      })) || [];

      setJobs(prevJobs => [...prevJobs, ...transformedJobs]);
      setHasMore(response.next !== null);
      setApiError(null); // Clear any previous errors
    } catch (error) {
      console.error('Failed to load more jobs:', error);
      setApiError('Failed to load more jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, searchQuery]); // Remove jobs.length dependency

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setActiveFilters({
      location: [],
      salary: [],
      experience: [],
      jobType: []
    });
    setAdvancedFilters({
      location: '',
      salaryRange: '',
      experienceLevel: '',
      jobTypes: [],
      workMode: '',
      companySize: '',
      skills: '',
      benefits: [],
      postedWithin: '',
      matchPercentage: 0
    });
  }, []);

  return (
    <MainLayout
      title="AI-Powered Job Feed"
      description="Find personalized job recommendations powered by AI"
      noPadding
      fullWidth
    >
      <SearchHeader
        onSearch={handleSearch}
        placeholder="Search jobs, companies, skills..."
      />

      <main className="container mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Filter Sidebar */}
          <JobFeedFilterSidebar
            filters={activeFilters}
            onFilterChange={(key, value) => setActiveFilters(prev => ({ ...prev, [key]: value }))}
            onApplyFilters={filters => setActiveFilters(filters)}
            onClearFilters={handleClearAllFilters}
          />

          {/* Jobs Grid and Controls */}
          <div className="lg:col-span-9">
            {/* Dashboard Header */}
            <div className="mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground mb-2">
                    AI-Powered Job Feed
                  </h1>
                  <p className="text-muted-foreground">
                    Discover personalized job opportunities with AI-driven matching
                  </p>
                </div>

                {/* Real-time status and controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
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
                    {realTimeMode ? '⚡ Real-Time ON' : '🔄 Enable Real-Time'}
                  </button>

                  {realTimeMode && (
                    <div className="text-sm text-gray-600">
                      {matches.length > 0 ? `${matches.length} live matches` : 'Searching...'}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {/* Refresh Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    loading={refreshing}
                    onClick={handleRefresh}
                    iconName="RefreshCw"
                    iconPosition="left"
                  >
                    Refresh
                  </Button>

                  {/* Bookmarks Toggle */}
                  <Button
                    variant={showBookmarkedOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                    iconName="Bookmark"
                    iconPosition="left"
                  >
                    {showBookmarkedOnly ? 'All Jobs' : 'Bookmarked'}
                  </Button>
                </div>
              </motion.div>
            </div>


            {/* API Error Display */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">Unable to load jobs</p>
                    <p className="text-red-700 text-sm mt-1">{apiError}</p>
                  </div>
                  <button
                    onClick={() => {
                      setApiError(null);
                      handleRefresh();
                    }}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Job Grid */}
            <JobGrid
              jobs={jobs}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              onBookmark={handleBookmark}
              onApply={handleApply}
              onQuickApply={handleQuickApply}
              showBookmarkedOnly={showBookmarkedOnly}
            />

            {/* Advanced Filter Panel */}
            <AdvancedFilterPanel
              isOpen={isAdvancedFilterOpen}
              onClose={() => setIsAdvancedFilterOpen(false)}
              filters={advancedFilters}
              onFiltersChange={setAdvancedFilters}
              onApplyFilters={() => {
                // Apply advanced filters logic
                console.log('Applying advanced filters:', advancedFilters);
              }}
              onClearFilters={() => {
                setAdvancedFilters({
                  location: '',
                  salaryRange: '',
                  experienceLevel: '',
                  jobTypes: [],
                  workMode: '',
                  companySize: '',
                  skills: '',
                  benefits: [],
                  postedWithin: '',
                  matchPercentage: 0
                });
              }}
            />
          </div>
        </div>
      </main>
      {/* Quick Apply Modal */}
      <QuickApplyModal
        isOpen={quickApplyOpen}
        job={quickApplyJob}
        onClose={() => setQuickApplyOpen(false)}
        onSuccess={(res) => {
          // TODO: optionally update local state or toast
        }}
      />
    </MainLayout>
  );
};

export default AIJobFeedDashboard;

