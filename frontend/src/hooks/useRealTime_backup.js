/**
 * React Hooks for Real-Time Job Application Features
 * 
 * Provides easy-to-use hooks for:
 * - Real-time job matching
 * - Live application tracking
 * - Dynamic status updates
 * - WebSocket connectivity
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Main hook for real-time functionality
 */
export const useRealTime = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  // Get WebSocket URL
  const getWebSocketURL = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NODE_ENV === 'development' 
      ? 'localhost:8000' 
      : window.location.host;
    return `${protocol}//${host}/ws/applications/`;
  };

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        setConnectionStatus('connecting');
        const token = localStorage.getItem('accessToken');
        const wsUrl = getWebSocketURL();
        const wsUrlWithAuth = token ? `${wsUrl}?token=${token}` : wsUrl;
        
        socketRef.current = new WebSocket(wsUrlWithAuth);
        
        socketRef.current.onopen = () => {
          console.log('🔌 WebSocket connected');
          setIsConnected(true);
          setConnectionStatus('connected');
          setError(null);
          reconnectAttemptsRef.current = 0;
          resolve();
        };
        
        socketRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
            
            // Trigger event listeners
            const listeners = listenersRef.current.get(data.type) || [];
            listeners.forEach(callback => {
              try {
                callback(data);
              } catch (err) {
                console.error('Error in WebSocket listener:', err);
              }
            });
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };
        
        socketRef.current.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          setIsConnected(false);
          setConnectionStatus('disconnected');
          
          // Attempt reconnection if not intentional
          if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            setTimeout(() => {
              console.log(`🔄 Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
              connect();
            }, 2000 * reconnectAttemptsRef.current);
          }
        };
        
        socketRef.current.onerror = (error) => {
          console.error('🚨 WebSocket error:', error);
          setError(error);
          setConnectionStatus('error');
          reject(error);
        };
        
      } catch (error) {
        setError(error);
        setConnectionStatus('error');
        reject(error);
      }
    });
  }, []);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close(1000, 'User disconnected');
      socketRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  // Send message to WebSocket
  const send = useCallback((data) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    } else {
      console.warn('WebSocket not connected. Cannot send message:', data);
      return false;
    }
  }, []);

  // Add event listener
  const on = useCallback((eventType, callback) => {
    const listeners = listenersRef.current.get(eventType) || [];
    listeners.push(callback);
    listenersRef.current.set(eventType, listeners);
  }, []);

  // Remove event listener
  const off = useCallback((eventType, callback) => {
    const listeners = listenersRef.current.get(eventType) || [];
    const filteredListeners = listeners.filter(listener => listener !== callback);
    listenersRef.current.set(eventType, filteredListeners);
  }, []);

  // Initialize connection
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    error,
    lastMessage,
    connect,
    disconnect,
    send,
    on,
    off
  };
};

/**
 * Hook for live application tracking
 */
export const useLiveApplications = () => {
  const { isConnected, on, off } = useRealTime();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handle real-time application updates
  useEffect(() => {
    const handleApplicationUpdate = (data) => {
      setApplications(prev => {
        const index = prev.findIndex(app => app.id === data.application.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...data.application };
          return updated;
        } else {
          return [...prev, data.application];
        }
      });
    };

    const handleApplicationStatusChange = (data) => {
      setApplications(prev => 
        prev.map(app => 
          app.id === data.application_id 
            ? { ...app, status: data.new_status }
            : app
        )
      );
    };

    if (isConnected) {
      on('application_update', handleApplicationUpdate);
      on('application_status_changed', handleApplicationStatusChange);
    }

    return () => {
      off('application_update', handleApplicationUpdate);
      off('application_status_changed', handleApplicationStatusChange);
    };
  }, [isConnected, on, off]);

  return {
    applications,
    loading: !isConnected && loading,
    isRealTimeConnected: isConnected
  };
};

/**
 * Hook for real-time job matching notifications
 */
export const useJobMatching = () => {
  const { isConnected, on, off } = useRealTime();
  const [matches, setMatches] = useState([]);
  const [newMatchCount, setNewMatchCount] = useState(0);

  useEffect(() => {
    const handleNewMatch = (data) => {
      setMatches(prev => [data.job, ...prev]);
      setNewMatchCount(prev => prev + 1);
    };

    if (isConnected) {
      on('new_job_match', handleNewMatch);
    }

    return () => {
      off('new_job_match', handleNewMatch);
    };
  }, [isConnected, on, off]);

  const clearNewMatchCount = useCallback(() => {
    setNewMatchCount(0);
  }, []);

  return {
    matches,
    newMatchCount,
    clearNewMatchCount,
    isRealTimeConnected: isConnected
  };
};

/**
 * Hook for connection status monitoring
 */
export const useConnectionStatus = () => {
  const { isConnected, connectionStatus, error } = useRealTime();

  return {
    isConnected,
    status: connectionStatus,
    error,
    isOnline: isConnected && connectionStatus === 'connected'
  };
};

export default useRealTime;
      setConnectionStatus('disconnected');
    };
  }, []);

  const reconnect = useCallback(() => {
    realTimeService.connect()
      .then(() => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
      })
      .catch(err => {
        setError(err);
        setConnectionStatus('error');
      });
  }, []);

  return {
    isConnected,
    connectionStatus,
    error,
    reconnect,
    status: realTimeService.getStatus()
  };
};

/**
 * Hook for real-time job matching
 */
export const useRealTimeJobMatching = (userProfile) => {
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startMatching = useCallback(async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      setError(null);
      
      await dynamicAPI.startRealTimeMatching(userProfile);
      realTimeService.requestJobMatching(userProfile);
      
      setIsMatching(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const stopMatching = useCallback(async () => {
    try {
      await dynamicAPI.stopRealTimeMatching();
      setIsMatching(false);
    } catch (err) {
      setError(err);
    }
  }, []);

  const getLiveScores = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const scores = await dynamicAPI.getLiveJobScores(params);
      return scores;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for job match updates
  useEffect(() => {
    const unsubscribe = realTimeService.subscribe(
      realTimeService.events.JOB_MATCH_UPDATE,
      (data) => {
        setMatches(prev => {
          const updated = [...prev];
          const existingIndex = updated.findIndex(m => m.job_id === data.job_id);
          
          if (existingIndex >= 0) {
            updated[existingIndex] = { ...updated[existingIndex], ...data };
          } else {
            updated.push(data);
          }
          
          return updated.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        });
      }
    );

    return unsubscribe;
  }, []);

  return {
    isMatching,
    matches,
    loading,
    error,
    startMatching,
    stopMatching,
    getLiveScores
  };
};

/**
 * Hook for dynamic job applications
 */
export const useDynamicApplications = () => {
  const [applications, setApplications] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const applyDynamically = useCallback(async (jobId, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await dynamicAPI.applyDynamically(jobId, options);
      
      if (result.success && result.application_id) {
        // Start real-time tracking
        realTimeService.startApplicationTracking(result.application_id);
        
        // Update local state
        setApplications(prev => {
          const updated = new Map(prev);
          updated.set(result.application_id, {
            id: result.application_id,
            jobId,
            status: 'applied',
            timestamp: new Date().toISOString(),
            ...result
          });
          return updated;
        });
      }
      
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const batchApply = useCallback(async (jobIds, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await dynamicAPI.batchApplyDynamically(jobIds, options);
      
      // Start tracking for successful applications
      results.results.forEach(result => {
        if (result.status === 'fulfilled' && result.data?.application_id) {
          realTimeService.startApplicationTracking(result.data.application_id);
        }
      });
      
      return results;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getApplicationStatus = useCallback(async (applicationId) => {
    try {
      const status = await dynamicAPI.getRealTimeApplicationStatus(applicationId);
      return status;
    } catch (err) {
      setError(err);
      return null;
    }
  }, []);

  // Listen for application status updates
  useEffect(() => {
    const unsubscribe = realTimeService.subscribe(
      realTimeService.events.APPLICATION_STATUS_CHANGE,
      (data) => {
        setApplications(prev => {
          const updated = new Map(prev);
          if (updated.has(data.application_id)) {
            const existing = updated.get(data.application_id);
            updated.set(data.application_id, {
              ...existing,
              status: data.new_status,
              lastUpdate: new Date().toISOString(),
              source: data.source
            });
          }
          return updated;
        });
      }
    );

    return unsubscribe;
  }, []);

  return {
    applications: Array.from(applications.values()),
    loading,
    error,
    applyDynamically,
    batchApply,
    getApplicationStatus
  };
};

/**
 * Hook for real-time application tracking
 */
export const useApplicationTracking = () => {
  const [trackingActive, setTrackingActive] = useState(false);
  const [trackingSummary, setTrackingSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startTracking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await dynamicAPI.startDynamicTracking();
      
      if (result.success) {
        setTrackingActive(true);
        // Request initial summary
        const summary = await dynamicAPI.getTrackingSummary();
        setTrackingSummary(summary);
      }
      
      return result;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const stopTracking = useCallback(async () => {
    try {
      await dynamicAPI.stopDynamicTracking();
      setTrackingActive(false);
    } catch (err) {
      setError(err);
    }
  }, []);

  const refreshSummary = useCallback(async () => {
    try {
      const summary = await dynamicAPI.getTrackingSummary();
      setTrackingSummary(summary);
      return summary;
    } catch (err) {
      setError(err);
      return null;
    }
  }, []);

  // Listen for tracking events
  useEffect(() => {
    const unsubscribes = [
      realTimeService.subscribe(
        realTimeService.events.APPLICATION_STATUS_CHANGE,
        (data) => {
          setEvents(prev => [{
            id: Date.now(),
            type: 'status_change',
            timestamp: new Date().toISOString(),
            ...data
          }, ...prev.slice(0, 49)]); // Keep last 50 events
        }
      ),
      
      realTimeService.subscribe(
        realTimeService.events.INTERVIEW_SCHEDULED,
        (data) => {
          setEvents(prev => [{
            id: Date.now(),
            type: 'interview_scheduled',
            timestamp: new Date().toISOString(),
            ...data
          }, ...prev.slice(0, 49)]);
        }
      ),
      
      realTimeService.subscribe(
        realTimeService.events.ANALYTICS_UPDATE,
        (data) => {
          setTrackingSummary(prev => ({
            ...prev,
            analytics: data
          }));
        }
      )
    ];

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  return {
    trackingActive,
    trackingSummary,
    events,
    loading,
    error,
    startTracking,
    stopTracking,
    refreshSummary
  };
};

/**
 * Hook for live analytics and metrics
 */
export const useLiveAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const refreshInterval = useRef(null);

  const refreshAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      realTimeService.requestAnalyticsUpdate();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const startAutoRefresh = useCallback((intervalMs = 60000) => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
    }
    
    refreshInterval.current = setInterval(refreshAnalytics, intervalMs);
    refreshAnalytics(); // Initial load
  }, [refreshAnalytics]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
      refreshInterval.current = null;
    }
  }, []);

  // Listen for analytics updates
  useEffect(() => {
    const unsubscribe = realTimeService.subscribe(
      realTimeService.events.ANALYTICS_UPDATE,
      (data) => {
        setAnalytics(data);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, [stopAutoRefresh]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics,
    startAutoRefresh,
    stopAutoRefresh
  };
};

/**
 * Hook for system health monitoring
 */
export const useSystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const healthStatus = await dynamicAPI.healthCheck();
      setHealth(healthStatus);
      
      return healthStatus;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-check health on mount
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    health,
    loading,
    error,
    checkHealth
  };
};
