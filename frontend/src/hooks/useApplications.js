import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../utils/api';
import { useRealTime } from './useRealTime';
import jobApplicationService from '../services/jobApplicationService';

export function useApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_applications: 0,
    pending_applications: 0,
    success_rate: 0
  });

  const { on, off } = useRealTime();

  // Fetch applications
  const fetchApplications = useCallback(async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest(
        `/applications/applications/?page=${page}&page_size=${pageSize}`,
        'GET'
      );

      if (response.results) {
        setApplications(response.results);
      } else if (Array.isArray(response)) {
        setApplications(response);
      }

      return response;
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dashboard data with stats
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest('/applications/dashboard/', 'GET');

      if (response.applications) {
        setApplications(response.applications);
      }

      if (response.stats) {
        setStats(response.stats);
      }

      return response;
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply to job
  const applyToJob = useCallback(async (jobId, applicationData = {}) => {
    try {
      setError(null);

      const response = await apiRequest(`/applications/apply/${jobId}/`, 'POST', {
        application_method: 'manual',
        enable_tracking: true,
        ...applicationData
      });

      if (response.status === 'success') {
        // Refresh applications list
        await fetchApplications();
        return response.application;
      } else {
        throw new Error(response.message || 'Failed to apply to job');
      }
    } catch (err) {
      console.error('Error applying to job:', err);
      setError(err.message);
      throw err;
    }
  }, [fetchApplications]);

  // Quick apply to job
  const quickApply = useCallback(async (jobId, applicationMethod = 'manual') => {
    try {
      setError(null);

      const response = await apiRequest('/applications/quick-apply/', 'POST', {
        job_id: jobId,
        application_method: applicationMethod
      });

      // Refresh applications list
      await fetchApplications();
      return response;
    } catch (err) {
      console.error('Error with quick apply:', err);
      setError(err.message);
      throw err;
    }
  }, [fetchApplications]);

  // Redirect-first apply helper (preferred)
  const redirectAndRecord = useCallback(async (job) => {
    try {
      setError(null);
      const response = await jobApplicationService.redirectAndRecord(
        typeof job === 'object' ? job : { id: job },
        { notes: 'Redirected from Applications hook' }
      );
      await fetchApplications();
      return response;
    } catch (err) {
      console.error('Error with redirect-and-record:', err);
      setError(err.message);
      throw err;
    }
  }, [fetchApplications]);

  // Update application status
  const updateApplicationStatus = useCallback(async (applicationId, newStatus, notes = '') => {
    try {
      setError(null);

      const response = await apiRequest(
        `/applications/applications/${applicationId}/update_status/`,
        'POST',
        {
          status: newStatus,
          notes: notes
        }
      );

      // Update local state
      setApplications(prev => prev.map(app =>
        app.id === applicationId
          ? { ...app, status: newStatus, notes: notes }
          : app
      ));

      return response;
    } catch (err) {
      console.error('Error updating application status:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Get application events
  const getApplicationEvents = useCallback(async (applicationId) => {
    try {
      const response = await apiRequest(
        `/applications/applications/${applicationId}/events/`,
        'GET'
      );
      return response;
    } catch (err) {
      console.error('Error fetching application events:', err);
      throw err;
    }
  }, []);

  // Get application stats
  const getApplicationStats = useCallback(async () => {
    try {
      const response = await apiRequest('/applications/applications/stats/', 'GET');
      setStats(response);
      return response;
    } catch (err) {
      console.error('Error fetching application stats:', err);
      throw err;
    }
  }, []);

  // Real-time event handlers
  useEffect(() => {
    const handleApplicationCreated = (payload) => {
      console.log('🆕 New application created:', payload);
      const data = payload?.application || payload;
      if (!data) return;
      // Add or upsert application
      setApplications(prev => {
        const id = data.id || data.application_id;
        if (!id) return prev;
        const exists = prev.some(a => a.id === id);
        if (exists) {
          return prev.map(a => (a.id === id ? { ...a, ...data } : a));
        }
        return [data, ...prev];
      });
      // Update stats
      setStats(prev => ({
        ...prev,
        total_applications: (prev.total_applications || 0) + 1,
        pending_applications: (prev.pending_applications || 0) + 1
      }));
    };

    const handleApplicationUpdate = (payload) => {
      console.log('🔄 Application updated:', payload);
      const data = payload?.application || payload;
      const id = data?.application_id || data?.id;
      const status = data?.status || data?.new_status;
      if (!id) return;
      setApplications(prev => prev.map(app =>
        app.id === id ? { ...app, ...data, ...(status ? { status } : {}) } : app
      ));
    };

    const handleStatusChange = (payload) => {
      console.log('📊 Application status changed:', payload);
      const id = payload?.application_id || payload?.id;
      const status = payload?.status || payload?.new_status;
      if (!id || !status) return;
      setApplications(prev => prev.map(app =>
        app.id === id
          ? { ...app, status }
          : app
      ));
    };

    // Subscribe to real-time events
    on('application_created', handleApplicationCreated);
    on('application_update', handleApplicationUpdate);
    on('status_updated', handleStatusChange);

    return () => {
      // Cleanup event listeners
      off('application_created', handleApplicationCreated);
      off('application_update', handleApplicationUpdate);
      off('status_updated', handleStatusChange);
    };
  }, [on, off]);

  // Initialize
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    applications,
    loading,
    error,
    stats,
    fetchApplications,
    fetchDashboardData,
    applyToJob,
    quickApply,
    updateApplicationStatus,
    getApplicationEvents,
    getApplicationStats,
    redirectAndRecord,
    refreshApplications: fetchApplications
  };
}
