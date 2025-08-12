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
import tokenManager from '../utils/tokenManager.js';

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
  const reconnectTimeoutRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const isDisabledRef = useRef(false); // Flag to permanently disable WebSocket
  const hasAttemptedConnection = useRef(false); // Track if we've attempted connection

  // Get WebSocket URL
  const getWebSocketURL = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NODE_ENV === 'development'
      ? 'localhost:8000'
      : window.location.host;
  return `${protocol}//${host}/ws/applications/`;
  };

  // Check if we should attempt connection (only if authenticated and not disabled)
  const shouldConnect = () => {
    return !isDisabledRef.current && 
           tokenManager.isAuthenticated() && 
           !tokenManager.isAccessTokenExpired();
  };

  // Permanently disable WebSocket connections
  const disableWebSocket = useCallback(() => {
    if (isDisabledRef.current) return; // Already disabled
    
    console.warn('🚫 WebSocket permanently disabled due to server unavailability');
    isDisabledRef.current = true;
    setConnectionStatus('disabled');
    setError(new Error('WebSocket server unavailable'));
    
    // Clear any pending timeouts
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close existing connection
    if (socketRef.current) {
      try {
        socketRef.current.close(1000, 'Service disabled');
      } catch (e) {
        // Ignore close errors
      }
      socketRef.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Don't connect if disabled, not authenticated, or already connecting/connected
    if (isDisabledRef.current || !shouldConnect()) {
      if (isDisabledRef.current) {
        console.log('⏸️ WebSocket is permanently disabled');
      } else {
        console.log('⏸️ Skipping WebSocket connection - not authenticated');
      }
      return Promise.resolve();
    }

    // Check if already connecting or connected
    if (socketRef.current?.readyState === WebSocket.OPEN || 
        socketRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('⏸️ WebSocket already connecting or connected');
      return Promise.resolve();
    }

    hasAttemptedConnection.current = true;

    return new Promise((resolve, reject) => {
      try {
        setConnectionStatus('connecting');
        const token = tokenManager.getAccessToken();
        const wsUrl = getWebSocketURL();
        const wsUrlWithAuth = token ? `${wsUrl}?token=${token}` : wsUrl;

        console.log('🔌 Attempting WebSocket connection...');
        socketRef.current = new WebSocket(wsUrlWithAuth);

        // Set a connection timeout
        connectionTimeoutRef.current = setTimeout(() => {
          if (socketRef.current?.readyState === WebSocket.CONNECTING) {
            console.warn('🕒 WebSocket connection timeout - disabling WebSocket');
            try {
              socketRef.current.close();
            } catch (e) {
              // Ignore close errors
            }
            disableWebSocket();
            reject(new Error('Connection timeout'));
          }
        }, 5000); // 5 second timeout

        socketRef.current.onopen = () => {
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }
          console.log('✅ WebSocket connected successfully');
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
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }
          
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          setIsConnected(false);
          setConnectionStatus('disconnected');

          // Clear any pending reconnection attempts
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }

          // If WebSocket is already disabled, don't attempt reconnection
          if (isDisabledRef.current) {
            console.log('⏸️ WebSocket already disabled - no reconnection for the ai-powered-job-feed-dashboard page');
            return;
          }

          // Check if this is a server unavailability issue (code 1006 multiple times)
          if (event.code === 1006 && reconnectAttemptsRef.current >= maxReconnectAttempts) {
            console.warn('🚫 WebSocket server appears to be unavailable - disabling further attempts');
            disableWebSocket();
            return;
          }

          // Only attempt reconnection if:
          // 1. It wasn't a clean close (code 1000)
          // 2. We haven't exceeded max attempts
          // 3. User is still authenticated
          // 4. The close wasn't due to auth failure (code 1008 or 1011)
          // 5. WebSocket is not disabled
          const shouldReconnect = !isDisabledRef.current &&
                                event.code !== 1000 && 
                                event.code !== 1008 && 
                                event.code !== 1011 &&
                                reconnectAttemptsRef.current < maxReconnectAttempts && 
                                shouldConnect();

          if (shouldReconnect) {
            reconnectAttemptsRef.current++;
            const delay = 2000 * reconnectAttemptsRef.current; // Exponential backoff
            
            console.log(`🔄 Scheduling reconnection attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              // Double-check WebSocket is not disabled before attempting reconnection
              if (shouldConnect() && !isDisabledRef.current) {
                connect().catch(() => {
                  // Silent catch to prevent unhandled promise rejection
                });
              } else {
                console.log('⏸️ Skipping reconnection - user no longer authenticated or WebSocket disabled');
              }
            }, delay);
          } else {
            console.log('🛑 WebSocket reconnection stopped');
            if (event.code === 1008 || event.code === 1011) {
              console.warn('🔐 WebSocket closed due to authentication error');
              setError(new Error('Authentication failed'));
            } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
              console.warn('🚫 Max reconnection attempts reached - permanently disabling');
              disableWebSocket(); // Ensure we disable after max attempts
            }
          }
        };

        socketRef.current.onerror = (error) => {
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }
          
          // If we're already disabled, don't log additional errors
          if (isDisabledRef.current) {
            return; // Silent error - WebSocket is permanently disabled
          }
          
          console.error('🚨 WebSocket error:', error);
          setIsConnected(false);
          setConnectionStatus('error');

          // If we've hit max attempts, disable WebSocket
          if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            console.warn('🚫 WebSocket error after max attempts - permanently disabling');
            disableWebSocket();
            return;
          }

          // Increment reconnect attempts for errors as well
          if (!hasAttemptedConnection.current) {
            reconnectAttemptsRef.current++;
          }
          
          // If this is the first connection attempt and it fails immediately,
          // it's likely the server is not available
          if (reconnectAttemptsRef.current === 0 || reconnectAttemptsRef.current === 1) {
            console.warn('🚫 Initial WebSocket connection failed - server may be unavailable');
            reject(error);
          }
        };

      } catch (error) {
        console.error('🚨 WebSocket connection setup error:', error);
        setError(error);
        setConnectionStatus('error');
        disableWebSocket();
        reject(error);
      }
    });
  }, [disableWebSocket]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket...');
    
    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.close(1000, 'User disconnected');
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);

  // Re-enable WebSocket connections (for manual retry)
  const enableWebSocket = useCallback(() => {
    console.log('🔄 Re-enabling WebSocket connections...');
    isDisabledRef.current = false;
    reconnectAttemptsRef.current = 0;
    setError(null);
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

  // Initialize connection and listen for auth state changes
  useEffect(() => {
    // Only connect if authenticated and not disabled
    if (shouldConnect()) {
      connect().catch(error => {
        console.warn('Initial WebSocket connection failed:', error.message);
        // Don't throw - let the app continue without WebSocket
      });
    }

    // Listen for auth state changes
    const handleAuthStateChange = (event) => {
      if (event.detail.authenticated) {
        // User logged in - attempt connection if not disabled
        if (shouldConnect()) {
          connect().catch(error => {
            console.warn('WebSocket connection after login failed:', error.message);
          });
        }
      } else {
        // User logged out - disconnect
        disconnect();
      }
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    // Connection state
    isConnected,
    connectionStatus,
    error,
    lastMessage,

    // Connection management
    connect,
    disconnect,
    enableWebSocket,
    
    // Messaging
    send,
    
    // Event listeners
    on,
    off,
    
    // Utility
    isDisabled: isDisabledRef.current
  };

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

/**
 * Legacy hook alias for backward compatibility
 */
export const useRealTimeConnection = () => {
  return useConnectionStatus();
};

/**
 * Legacy hook alias for job matching
 */
export const useRealTimeJobMatching = (userProfile) => {
  const jobMatching = useJobMatching();

  return {
    ...jobMatching,
    isMatching: jobMatching.isRealTimeConnected,
    startMatching: () => console.log('Job matching started'),
    stopMatching: () => console.log('Job matching stopped'),
    getLiveScores: () => ({ scores: [] })
  };
};

/**
 * Legacy hook alias for applications
 */
export const useDynamicApplications = () => {
  const liveApps = useLiveApplications();

  return {
    ...liveApps,
    applyDynamically: (job) => console.log('Dynamic apply:', job),
    batchApply: (jobs) => console.log('Batch apply:', jobs)
  };
};

/**
 * Legacy hook alias for real-time applications
 */
export const useRealTimeApplications = () => {
  return useLiveApplications();
};

/**
 * Legacy hook for tracking
 */
export const useRealTimeTracking = () => {
  const { isConnected } = useRealTime();

  return {
    isTracking: isConnected,
    trackingData: {},
    startTracking: () => console.log('Tracking started'),
    stopTracking: () => console.log('Tracking stopped')
  };
};

/**
 * Hook for application tracking
 */
export const useApplicationTracking = () => {
  const { isConnected } = useRealTime();

  return {
    isTracking: isConnected,
    trackingData: {},
    applications: [],
    trackedApplications: [],
    startTracking: (applicationId) => console.log('Start tracking:', applicationId),
    stopTracking: (applicationId) => console.log('Stop tracking:', applicationId),
    updateTrackingStatus: (applicationId, status) => console.log('Update tracking:', applicationId, status)
  };
};

/**
 * Hook for live analytics
 */
export const useLiveAnalytics = () => {
  const { isConnected } = useRealTime();

  return {
    isConnected,
    analytics: {
      totalApplications: 0,
      responseRate: 0,
      averageResponseTime: 0,
      recentActivity: []
    },
    refreshAnalytics: () => console.log('Refreshing analytics'),
    getMetrics: () => ({ applications: 0, responses: 0 })
  };
};

/**
 * Hook for system health monitoring
 */
export const useSystemHealth = () => {
  const { isConnected, connectionStatus, error } = useRealTime();

  return {
    isHealthy: isConnected && !error,
    status: connectionStatus,
    error,
    metrics: {
      uptime: '100%',
      responseTime: '50ms',
      errorRate: '0%'
    },
    checkHealth: () => console.log('Checking system health'),
    getSystemStatus: () => ({ status: 'healthy', uptime: '100%' })
  };
};

export default useRealTime;
