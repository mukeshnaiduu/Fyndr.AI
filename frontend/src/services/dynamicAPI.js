/**
 * Dynamic API Service for Real-Time Job Application System
 * 
 * Connects to the new dynamic backend services:
 * - DynamicJobMatchingEngine
 * - DynamicApplicationService  
 * - DynamicApplicationTracker
 */

import { apiRequest } from '../utils/api';

class DynamicAPIService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }

  // ============================================================================
  // DYNAMIC JOB MATCHING APIS
  // ============================================================================

  /**
   * Start real-time job matching for user
   */
  async startRealTimeMatching(userProfile) {
    try {
      const response = await apiRequest('/api/jobmatcher/start-realtime/', {
        method: 'POST',
        data: { user_profile: userProfile }
      });
      return response;
    } catch (error) {
      console.error('❌ Failed to start real-time matching:', error);
      throw error;
    }
  }

  /**
   * Stop real-time job matching
   */
  async stopRealTimeMatching() {
    try {
      const response = await apiRequest('/api/jobmatcher/stop-realtime/', {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('❌ Failed to stop real-time matching:', error);
      throw error;
    }
  }

  /**
   * Get live job scores for user
   */
  async getLiveJobScores(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await apiRequest(`/api/jobmatcher/live-scores/?${queryParams}`);
      return response;
    } catch (error) {
      console.error('❌ Failed to get live job scores:', error);
      throw error;
    }
  }

  /**
   * Score a specific job dynamically
   */
  async scoreJobDynamically(jobId, userProfile) {
    try {
      const response = await apiRequest('/api/jobmatcher/score-job/', {
        method: 'POST',
        data: {
          job_id: jobId,
          user_profile: userProfile
        }
      });
      return response;
    } catch (error) {
      console.error('❌ Failed to score job dynamically:', error);
      throw error;
    }
  }

  // ============================================================================
  // DYNAMIC APPLICATION APIS
  // ============================================================================

  /**
   * Apply to job with dynamic real-time processing
   */
  async applyDynamically(jobId, options = {}) {
    try {
  const response = await apiRequest('/api/applications/apply-dynamically/', 'POST', {
        job_id: jobId,
        options: {
          auto_customize: options.autoCustomize ?? true,
          follow_external_links: options.followExternalLinks ?? true,
          notes: options.notes ?? ''
        }
      });
      return response;
    } catch (error) {
      console.error('❌ Failed to apply dynamically:', error);
      throw error;
    }
  }

  /**
   * Get live application status
   */
  async getLiveApplicationStatus(applicationId) {
    try {
  const response = await apiRequest(`/api/applications/monitor-status/${applicationId}/`);
      return response;
    } catch (error) {
      console.error('❌ Failed to get live application status:', error);
      throw error;
    }
  }

  /**
   * Start application monitoring
   */
  async startApplicationMonitoring(applicationId) {
    try {
  const response = await apiRequest('/api/applications/start-monitoring/', {
        method: 'POST',
        data: { application_id: applicationId }
      });
      return response;
    } catch (error) {
      console.error('❌ Failed to start application monitoring:', error);
      throw error;
    }
  }

  /**
   * Stop application monitoring
   */
  async stopApplicationMonitoring(applicationId) {
    try {
  const response = await apiRequest('/api/applications/stop-monitoring/', {
        method: 'POST',
        data: { application_id: applicationId }
      });
      return response;
    } catch (error) {
      console.error('❌ Failed to stop application monitoring:', error);
      throw error;
    }
  }

  /**
   * Verify application (mark as verified and optionally set confirmation number)
   */
  async verifyApplication(applicationId, data = {}) {
    try {
      const response = await apiRequest(`/api/applications/verify/${applicationId}/`, {
        method: 'POST',
        data
      });
      return response;
    } catch (error) {
      console.error('❌ Failed to verify application:', error);
      throw error;
    }
  }

  // ============================================================================
  // DYNAMIC TRACKING APIS
  // ============================================================================

  /**
   * Get real-time tracking summary
   */
  async getTrackingSummary() {
    try {
      const response = await apiRequest('/api/jobtracker/tracking/');
      return response;
    } catch (error) {
      console.error('❌ Failed to get tracking summary:', error);
      throw error;
    }
  }

  /**
   * Start dynamic tracking for current user
   */
  async startDynamicTracking() {
    try {
      const response = await apiRequest('/api/jobtracker/tracking/', {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('❌ Failed to start dynamic tracking:', error);
      throw error;
    }
  }

  /**
   * Stop dynamic tracking for current user
   */
  async stopDynamicTracking() {
    try {
      const response = await apiRequest('/api/jobtracker/tracking/', {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('❌ Failed to stop dynamic tracking:', error);
      throw error;
    }
  }

  /**
   * Get real-time status for specific application
   */
  async getRealTimeApplicationStatus(applicationId) {
    try {
      const response = await apiRequest(`/api/jobtracker/application/${applicationId}/status/`);
      return response;
    } catch (error) {
      console.error('❌ Failed to get real-time application status:', error);
      throw error;
    }
  }

  /**
   * Get tracking statistics (admin only)
   */
  async getTrackingStats() {
    try {
      const response = await apiRequest('/api/jobtracker/tracking/stats/');
      return response;
    } catch (error) {
      console.error('❌ Failed to get tracking stats:', error);
      throw error;
    }
  }

  /**
   * Start global tracking (admin only)
   */
  async startGlobalTracking() {
    try {
      const response = await apiRequest('/api/jobtracker/tracking/start-global/', {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('❌ Failed to start global tracking:', error);
      throw error;
    }
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * Apply to multiple jobs dynamically
   */
  async batchApplyDynamically(jobIds, options = {}) {
    try {
      const promises = jobIds.map(jobId =>
        this.applyDynamically(jobId, options)
      );

      const results = await Promise.allSettled(promises);

      return {
        total: jobIds.length,
        successful: results.filter(r => r.status === 'fulfilled').length,
        failed: results.filter(r => r.status === 'rejected').length,
        results: results.map((result, index) => ({
          jobId: jobIds[index],
          status: result.status,
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason : null
        }))
      };
    } catch (error) {
      console.error('❌ Failed to batch apply dynamically:', error);
      throw error;
    }
  }

  /**
   * Get live scores for multiple jobs
   */
  async batchGetLiveScores(jobIds, userProfile) {
    try {
      const promises = jobIds.map(jobId =>
        this.scoreJobDynamically(jobId, userProfile)
      );

      const results = await Promise.allSettled(promises);

      return results.map((result, index) => ({
        jobId: jobIds[index],
        status: result.status,
        score: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }));
    } catch (error) {
      console.error('❌ Failed to batch get live scores:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Health check for dynamic services
   */
  async healthCheck() {
    try {
      const checks = await Promise.allSettled([
        apiRequest('/api/jobmatcher/health/'),
        apiRequest('/api/jobapplier/health/'),
        apiRequest('/api/jobtracker/health/')
      ]);

      return {
        jobmatcher: checks[0].status === 'fulfilled',
        jobapplier: checks[1].status === 'fulfilled',
        jobtracker: checks[2].status === 'fulfilled',
        overall: checks.every(check => check.status === 'fulfilled')
      };
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        jobmatcher: false,
        jobapplier: false,
        jobtracker: false,
        overall: false
      };
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus() {
    try {
      const response = await apiRequest('/api/system/status/');
      return response;
    } catch (error) {
      console.error('❌ Failed to get system status:', error);
      throw error;
    }
  }
}

// Create singleton instance
const dynamicAPI = new DynamicAPIService();

export default dynamicAPI;
