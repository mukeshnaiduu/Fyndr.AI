import { useState, useEffect, useCallback, useRef } from 'react';
import jobsAPI from '../services/jobsAPI';

// Debounce utility
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useJobs = (initialParams = {}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(initialParams);
  const requestIdRef = useRef(0);

  // Use refs to store current values without causing re-renders
  const filtersRef = useRef(filters);
  const currentPageRef = useRef(currentPage);

  // Update refs when values change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const fetchJobs = useCallback(async (params = {}, append = false) => {
    const currentRequestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError(null);

      const searchParams = {
        ...filtersRef.current,
        ...params,
        page: append ? currentPageRef.current + 1 : 1,
        pageSize: 20
      };

      const response = await jobsAPI.fetchJobs(searchParams);

      // Only update if this is still the most recent request
      if (currentRequestId !== requestIdRef.current) {
        return; // Request was superseded
      }

      // Transform API data to frontend format
      const transformedJobs = response.results.map(job =>
        jobsAPI.transformJobData(job)
      );

      if (append) {
        setJobs(prevJobs => [...prevJobs, ...transformedJobs]);
        setCurrentPage(prev => prev + 1);
      } else {
        setJobs(transformedJobs);
        setCurrentPage(1);
      }

      setTotalCount(response.count);
      setHasMore(!!response.next);

    } catch (err) {
      // Only update if this is still the most recent request
      if (currentRequestId !== requestIdRef.current) {
        return; // Request was superseded
      }

      console.error('Error fetching jobs:', err);

      // Handle authentication errors gracefully
      if (err.message.includes('Authentication required') || err.message.includes('401')) {
        setError('Jobs loaded without personalization. Log in for personalized recommendations.');
        console.warn('🔓 Loading jobs without authentication - limited features available');
      } else if (err.message.includes('cooldown')) {
        // Don't set error for cooldown - just wait
        console.log('⏳ Request in cooldown, skipping...');
      } else {
        setError(err.message);
      }
    } finally {
      // Only update if this is still the most recent request
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []); // No dependencies - use refs for current values

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchJobs(filtersRef.current, true);
    }
  }, [fetchJobs, loading, hasMore]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    fetchJobs(filtersRef.current, false);
  }, [fetchJobs]);

  // Track if this is the initial load
  const isInitialLoad = useRef(true);
  const lastFiltersRef = useRef(JSON.stringify(initialParams));

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      fetchJobs();
    }
  }, []); // Empty dependencies - only run once on mount

  // Reload when filters actually change
  useEffect(() => {
    const currentFiltersString = JSON.stringify(filters);

    // Only fetch if filters actually changed from last fetch
    if (!isInitialLoad.current && currentFiltersString !== lastFiltersRef.current) {
      lastFiltersRef.current = currentFiltersString;

      // Add a small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        fetchJobs(filters, false);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [JSON.stringify(filters)]); // Use string comparison for stable dependency

  return {
    jobs,
    loading,
    error,
    hasMore,
    totalCount,
    currentPage,
    filters,
    loadMore,
    updateFilters,
    refresh,
    fetchJobs
  };
};

export const useJobStats = (filters = {}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  // Debounce filters to prevent rapid API calls
  const debouncedFilters = useDebounce(JSON.stringify(filters), 500);

  useEffect(() => {
    const fetchStats = async () => {
      const currentRequestId = ++requestIdRef.current;

      try {
        setLoading(true);
        setError(null);
        const parsedFilters = JSON.parse(debouncedFilters);
        const response = await jobsAPI.fetchJobStats(parsedFilters);

        // Only update if this is still the most recent request
        if (currentRequestId === requestIdRef.current) {
          setStats(response);
        }
      } catch (err) {
        // Only update if this is still the most recent request
        if (currentRequestId === requestIdRef.current) {
          if (err.message.includes('cooldown')) {
            // Don't set error for cooldown - just log and continue
            console.log('⏳ Job stats request in cooldown, skipping...');
          } else {
            setError(err.message);
            console.error('Error fetching job stats:', err);
          }
        }
      } finally {
        // Only update if this is still the most recent request
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchStats();
  }, [debouncedFilters]);

  return { stats, loading, error };
};

export const useFilterOptions = (filters = {}) => {
  const [filterOptions, setFilterOptions] = useState({
    companies: [],
    locations: [],
    sources: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  // Debounce filters to prevent rapid API calls
  const debouncedFilters = useDebounce(JSON.stringify(filters), 500);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      const currentRequestId = ++requestIdRef.current;

      try {
        setLoading(true);
        setError(null);
        const parsedFilters = JSON.parse(debouncedFilters);
        const response = await jobsAPI.fetchFilterOptions(parsedFilters);

        // Only update if this is still the most recent request
        if (currentRequestId === requestIdRef.current) {
          setFilterOptions(response);
        }
      } catch (err) {
        // Only update if this is still the most recent request
        if (currentRequestId === requestIdRef.current) {
          if (err.message.includes('cooldown')) {
            // Don't set error for cooldown - just log and continue
            console.log('⏳ Filter options request in cooldown, skipping...');
          } else {
            setError(err.message);
            console.error('Error fetching filter options:', err);
          }
        }
      } finally {
        // Only update if this is still the most recent request
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchFilterOptions();
  }, [debouncedFilters]);

  return { filterOptions, loading, error };
};

export const useJobDetail = (jobId) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJob = useCallback(async (id) => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await jobsAPI.fetchJobById(id);
      const transformedJob = jobsAPI.transformJobData(response);
      setJob(transformedJob);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching job detail:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (jobId) {
      fetchJob(jobId);
    }
  }, [jobId, fetchJob]);

  return { job, loading, error, refetch: () => fetchJob(jobId) };
};
