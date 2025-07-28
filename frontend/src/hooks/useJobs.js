import { useState, useEffect, useCallback } from 'react';
import jobsAPI from '../services/jobsAPI';

export const useJobs = (initialParams = {}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(initialParams);

  const fetchJobs = useCallback(async (params = {}, append = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = { 
        ...filters, 
        ...params,
        page: append ? currentPage + 1 : 1,
        pageSize: 20
      };
      
      const response = await jobsAPI.fetchJobs(searchParams);
      
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
      setError(err.message);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchJobs(filters, true);
    }
  }, [fetchJobs, filters, loading, hasMore]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    fetchJobs(filters, false);
  }, [fetchJobs, filters]);

  // Initial load
  useEffect(() => {
    fetchJobs();
  }, []);

  // Reload when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchJobs(filters, false);
    }
  }, [filters, fetchJobs]);

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await jobsAPI.fetchJobStats(filters);
        setStats(response);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching job stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [filters]);

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

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await jobsAPI.fetchFilterOptions(filters);
        setFilterOptions(response);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching filter options:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, [filters]);

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
