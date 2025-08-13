/**
 * Job Application Service with Real-time Features
 * 
 * Handles dynamic job applications, batch processing, and real-time status tracking
 */

import { apiRequest } from '../utils/api';
import tokenManager from '../utils/tokenManager';

// Lazy imports to avoid circular dependencies and missing service errors
let dynamicAPI = null;
let realTimeService = null;

// Initialize services with error handling
const initializeServices = async () => {
  if (!dynamicAPI) {
    try {
      const module = await import('./dynamicAPI');
      dynamicAPI = module.default;
    } catch (error) {
      console.warn('dynamicAPI service not available:', error.message);
      dynamicAPI = createMockDynamicAPI();
    }
  }
  
  if (!realTimeService) {
    try {
      const module = await import('./realTimeService');
      realTimeService = module.default;
    } catch (error) {
      console.warn('realTimeService not available:', error.message);
      realTimeService = createMockRealTimeService();
    }
  }
};

// Mock dynamicAPI for when service is not available
const createMockDynamicAPI = () => ({
  applyDynamically: async (jobId, options) => {
    console.warn('dynamicAPI not available - using fallback');
    return { success: false, error: 'Dynamic API not available' };
  },
  batchApplyDynamically: async (jobIds, options) => {
    console.warn('dynamicAPI not available - using fallback');
    return { success: false, results: [], error: 'Dynamic API not available' };
  },
  startApplicationMonitoring: async (applicationId) => {
    console.warn('dynamicAPI not available - skipping monitoring');
    return { success: false, error: 'Dynamic API not available' };
  },
  stopApplicationMonitoring: async (applicationId) => {
    console.warn('dynamicAPI not available - skipping monitoring stop');
    return { success: true };
  }
});

// Mock realTimeService for when service is not available
const createMockRealTimeService = () => ({
  startApplicationTracking: (applicationId) => {
    // Silent fallback - no need to spam console
  },
  stopApplicationTracking: (applicationId) => {
    // Silent fallback - no need to spam console
  },
  subscribe: (event, callback) => {
    // Silent fallback - no need to spam console
    return () => {}; // Return empty unsubscribe function
  },
  events: {
    APPLICATION_STATUS_CHANGE: 'APPLICATION_STATUS_CHANGE'
  }
});

class JobApplicationService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    this.activeTracking = new Map(); // Track active real-time monitoring
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  // Initialize services asynchronously
  async initialize() {
    if (this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = initializeServices().then(() => {
      this.isInitialized = true;
      console.log('JobApplicationService initialized');
    }).catch(error => {
      console.warn('JobApplicationService initialization failed:', error.message);
      this.isInitialized = true; // Mark as initialized even if services failed
    });

    return this.initializationPromise;
  }

  // Ensure services are initialized before use
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Apply to a single job with dynamic real-time processing
   */
  async applyToJob(jobId, options = {}) {
    await this.ensureInitialized();
    
    const {
      applicationMode = 'dynamic', // 'dynamic', 'manual', 'batch'
      autoCustomize = true,
      followExternalLinks = true,
      notes = ''
    } = options;

  try {
      let response;

      if (applicationMode === 'dynamic' && dynamicAPI) {
        // Use new dynamic API for real-time processing
        try {
          response = await dynamicAPI.applyDynamically(jobId, {
            autoCustomize,
            followExternalLinks,
            notes
          });
        } catch (error) {
          console.warn('Dynamic API failed, falling back to legacy API:', error.message);
          // Fallback to legacy API
          response = await apiRequest(`/applications/apply/${jobId}/`, 'POST', {
            application_method: applicationMode,
            enable_tracking: true,
            notes: notes || '',
            resume_text: '',
            cover_letter_text: '',
            custom_answers: {}
          });
        }
  } else {
        // Fallback to legacy API with correct data structure
        response = await apiRequest(`/applications/apply/${jobId}/`, 'POST', {
          application_method: applicationMode,
          enable_tracking: true,
          notes: notes || '',
          resume_text: '',
          cover_letter_text: '',
          custom_answers: {}
        });
      }

      // Start real-time tracking if application was successful and service is available
  const isOk = response?.success === true || response?.status === 'success' || response?.already_applied === true;
  const applicationId = response?.application_id || response?.application?.id;
  if (isOk && applicationId && applicationMode === 'dynamic') {
        try {
          await this.startRealtimeTracking(applicationId);
        } catch (trackingError) {
          console.warn('Failed to start real-time tracking:', trackingError.message);
          // Continue without real-time tracking - don't fail the application
        }
      }

      // Normalize response for UI expectations
      return {
        success: isOk,
        application_id: applicationId,
  confirmation_number: response?.confirmation_number || response?.application?.external_application_id || null,
        external_link_followed: !!response?.follow_external_links,
        application: response?.application || null,
  message: response?.message || response?.detail || null,
  already_applied: !!response?.already_applied,
        raw: response
      };
    } catch (error) {
      console.error('Error applying to job:', error);
      throw error;
    }
  }

  /**
   * Redirect-first apply: open the external careers URL and record a minimal application as 'redirect'.
   * If the job list provides a URL, we open it in a new tab and then call the backend to create an app.
   */
  async redirectAndRecord(job, options = {}) {
    // Open external careers page
    try {
      // Prefer explicit application URL if present, then canonical job URL from DB
      const url = job?.application_url || job?.apply_url || job?.url || job?.job_url || job?.jobUrl;
      if (url && /^https?:\/\//i.test(url)) {
        window.open(url, '_blank', 'noopener');
      }
    } catch {}

    // Record minimal application with method 'redirect'
    const res = await apiRequest(`/applications/apply/${job.id}/`, 'POST', {
      application_method: 'redirect',
      enable_tracking: true,
      notes: options.notes || 'Redirected to careers site',
      resume_text: '',
      cover_letter_text: '',
      custom_answers: {}
    });

    return res;
  }

  /**
   * Confirm that the user has applied manually; marks status as 'applied' and optionally sets a URL or confirmation.
   */
  async confirmApplied(applicationId, { confirmationNumber, applicationUrl } = {}) {
    const payload = {};
    if (confirmationNumber) payload.confirmation_number = confirmationNumber;
    if (applicationUrl) payload.application_url = applicationUrl;
    return apiRequest(`/applications/confirm-applied/${applicationId}/`, 'POST', payload);
  }

  /**
   * Apply to multiple jobs in batch with dynamic processing
   */
  async applyToMultipleJobs(jobIds, options = {}) {
    const {
      maxConcurrent = 3,
      delayBetweenApplications = 30,
      autoCustomize = true,
      followExternalLinks = true,
      useDynamicAPI = true
    } = options;

    try {
      if (useDynamicAPI) {
  // Use new dynamic batch API
        const response = await dynamicAPI.batchApplyDynamically(jobIds, {
          autoCustomize,
          followExternalLinks
        });

        // Start tracking for successful applications
        response.results.forEach(result => {
          if (result.status === 'fulfilled' && result.data?.application_id) {
            this.startRealtimeTracking(result.data.application_id);
          }
        });

  return response;
      } else {
        // Fallback to legacy batch API
        const response = await apiRequest('/applications/apply/batch/', 'POST', {
          job_ids: jobIds,
          max_concurrent: maxConcurrent,
          delay_between_applications: delayBetweenApplications,
          auto_customize: autoCustomize,
          follow_external_links: followExternalLinks
        });

        // Start tracking for successful applications
        if (response.successful_applications) {
          response.successful_applications.forEach(app => {
            this.startRealtimeTracking(app.application_id);
          });
        }

        return response;
      }
    } catch (error) {
      console.error('Error in batch application:', error);
      throw error;
    }
  }

  /**
   * Get user's job applications with pagination and real-time updates
   */
  async getUserApplications(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.status) queryParams.append('status', params.status);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);

    try {
      const response = await apiRequest(`/applications/applications/?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching user applications:', error);
      throw error;
    }
  }

  /**
   * Get application status history
   */
  async getApplicationStatusHistory(applicationId) {
    try {
      const response = await apiRequest(`/applications/applications/${applicationId}/status-history/`);
      return response;
    } catch (error) {
      console.error('Error fetching application status history:', error);
      throw error;
    }
  }

  /**
   * Update application status manually
   */
  async updateApplicationStatus(applicationId, status, notes = '') {
    try {
  const response = await apiRequest(`/applications/applications/${applicationId}/update-status/`, 'POST', {
        status, notes
      });

      // Trigger status update event
      this.dispatchStatusUpdate(applicationId, status);

      return response;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  /**
   * Start real-time tracking for an application using WebSocket connection
   */
  async startRealtimeTracking(applicationId) {
    try {
      // Start backend monitoring
      const response = await dynamicAPI.startApplicationMonitoring(applicationId);

      if (response.success) {
        // Start WebSocket tracking
        realTimeService.startApplicationTracking(applicationId);

        // Subscribe to status updates for this application
        const unsubscribe = realTimeService.subscribe(
          realTimeService.events.APPLICATION_STATUS_CHANGE,
          (data) => {
            if (data.application_id === applicationId) {
              this.dispatchStatusUpdate(applicationId, data.new_status, data);
            }
          }
        );

        // Store tracking info
        this.activeTracking.set(applicationId, {
          unsubscribe,
          lastStatus: null,
          startedAt: new Date().toISOString()
        });

        console.log(`🚀 Started real-time tracking for application ${applicationId}`);
      }

      return response;
    } catch (error) {
      console.error('Error starting real-time tracking:', error);
      throw error;
    }
  }

  /**
   * Start frontend polling for application status updates
   */
  startFrontendPolling(applicationId, interval = 60000) { // Poll every minute
    if (this.activeTracking.has(applicationId)) {
      return; // Already tracking this application
    }

    const pollInterval = setInterval(async () => {
      try {
        const history = await this.getApplicationStatusHistory(applicationId);

        if (history.success && history.status_history.length > 0) {
          const latestStatus = history.status_history[0];

          // Check if status changed since last check
          const lastKnownStatus = this.activeTracking.get(applicationId)?.lastStatus;

          if (!lastKnownStatus || lastKnownStatus !== latestStatus.status) {
            // Status changed - dispatch event
            this.dispatchStatusUpdate(applicationId, latestStatus.status, latestStatus);

            // Update tracking info
            this.activeTracking.set(applicationId, {
              interval: pollInterval,
              lastStatus: latestStatus.status,
              lastChecked: new Date()
            });
          }
        }
      } catch (error) {
        console.error(`Error polling status for application ${applicationId}:`, error);
      }
    }, interval);

    // Store tracking info
    this.activeTracking.set(applicationId, {
      interval: pollInterval,
      lastStatus: null,
      lastChecked: new Date()
    });
  }

  /**
   * Stop real-time tracking for an application
   */
  async stopRealtimeTracking(applicationId) {
    try {
      // Stop backend monitoring
      await dynamicAPI.stopApplicationMonitoring(applicationId);

      // Stop WebSocket tracking
      realTimeService.stopApplicationTracking(applicationId);

      // Unsubscribe from events and clean up
      const tracking = this.activeTracking.get(applicationId);
      if (tracking?.unsubscribe) {
        tracking.unsubscribe();
      }
      this.activeTracking.delete(applicationId);

      console.log(`🛑 Stopped real-time tracking for application ${applicationId}`);
    } catch (error) {
      console.error('Error stopping real-time tracking:', error);
    }
  }

  /**
   * Verify an application now (manual/email/ats)
   */
  async verifyApplication(applicationId, data = {}) {
    await this.ensureInitialized();
    try {
      const response = await dynamicAPI.verifyApplication(applicationId, data);
      return response;
    } catch (error) {
      console.error('Error verifying application:', error);
      throw error;
    }
  }

  /**
   * Stop all real-time tracking
   */
  stopAllTracking() {
    this.activeTracking.forEach((tracking, applicationId) => {
      if (tracking.unsubscribe) {
        tracking.unsubscribe();
      }
      realTimeService.stopApplicationTracking(applicationId);
    });
    this.activeTracking.clear();
    console.log('🛑 Stopped all real-time tracking');
  }

  /**
   * Dispatch status update event
   */
  dispatchStatusUpdate(applicationId, status, details = null) {
    const event = new CustomEvent('applicationStatusUpdate', {
      detail: {
        applicationId,
        status,
        details,
        timestamp: new Date()
      }
    });

    window.dispatchEvent(event);
  }

  /**
   * Get application analytics
   */
  async getApplicationAnalytics(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.timeRange) queryParams.append('time_range', params.timeRange);
    if (params.userId) queryParams.append('user_id', params.userId);

    try {
      const response = await apiRequest(`/jobtracker/api/stats/summary?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching application analytics:', error);
      throw error;
    }
  }

  /**
   * Bulk actions for applications
   */
  async bulkUpdateApplications(applicationIds, action, data = {}) {
    try {
      const promises = applicationIds.map(id => {
        switch (action) {
          case 'update_status':
            return this.updateApplicationStatus(id, data.status, data.notes);
          case 'start_tracking':
            return this.startRealtimeTracking(id);
          case 'withdraw':
            return this.withdrawApplication(id);
          default:
            throw new Error(`Unknown bulk action: ${action}`);
        }
      });

      const results = await Promise.allSettled(promises);

      return {
        success: true,
        results: results.map((result, index) => ({
          applicationId: applicationIds[index],
          success: result.status === 'fulfilled',
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason : null
        }))
      };
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw error;
    }
  }

  /**
   * Withdraw an application
   */
  async withdrawApplication(applicationId, reason = '') {
    try {
      const response = await apiRequest(`/applications/applications/${applicationId}/withdraw/`, 'POST', {
        reason
      });

      // Stop tracking if withdrawal successful
      if (response.success) {
        this.stopRealtimeTracking(applicationId);
        this.dispatchStatusUpdate(applicationId, 'withdrawn');
      }

      return response;
    } catch (error) {
      console.error('Error withdrawing application:', error);
      throw error;
    }
  }

  /**
   * Export applications data
   */
  async exportApplications(format = 'json', filters = {}) {
    try {
      const applications = await this.getUserApplications(filters);

      if (format === 'csv') {
        return this.convertToCSV(applications.applications);
      }

      return applications;
    } catch (error) {
      console.error('Error exporting applications:', error);
      throw error;
    }
  }

  /**
   * Convert applications data to CSV format
   */
  convertToCSV(applications) {
    if (!applications || applications.length === 0) {
      return '';
    }

    const headers = ['Application ID', 'Job Title', 'Company', 'Status', 'Applied Date', 'Confirmation Number'];
    const csvContent = [
      headers.join(','),
      ...applications.map(app => [
        app.id,
        `"${app.job_details?.title || ''}"`,
        `"${app.job_details?.company || ''}"`,
        app.status,
        app.applied_at,
        app.confirmation_number || ''
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Get real-time application statistics
   */
  getRealtimeStats() {
    return {
      activeTracking: this.activeTracking.size,
      trackedApplications: Array.from(this.activeTracking.keys()),
      lastActivity: Array.from(this.activeTracking.values())
        .reduce((latest, tracking) => {
          return tracking.lastChecked > latest ? tracking.lastChecked : latest;
        }, new Date(0))
    };
  }
}

// Create singleton instance
const jobApplicationService = new JobApplicationService();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  jobApplicationService.stopAllTracking();
});

export default jobApplicationService;
