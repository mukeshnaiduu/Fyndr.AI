/**
 * Real-Time WebSocket Service for Dynamic Job Application Updates
 * 
 * Provides live updates for:
 * - Job matching scores
 * - Application status changes  
 * - Real-time notifications
 * - Live analytics updates
 */

import tokenManager from '../utils/tokenManager';

class RealTimeService {
  constructor() {
    this.wsUrl = this._getWebSocketURL();
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnected = false;
    this.heartbeatInterval = null;
    this.fallbackMode = false;
    this.reconnectTimeout = null;
    
    // Event types
    this.events = {
      JOB_MATCH_UPDATE: 'job_match_update',
      APPLICATION_STATUS_CHANGE: 'application_status_change',
      INTERVIEW_SCHEDULED: 'interview_scheduled', 
      APPLICATION_COMPLETED: 'application_completed',
      ANALYTICS_UPDATE: 'analytics_update',
      SYSTEM_NOTIFICATION: 'system_notification'
    };
  }

  /**
   * Connect to WebSocket server with improved error handling
   */
  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Resolve a fresh authentication token if available
        const resolveToken = async () => {
          try {
            if (tokenManager.isAuthenticated()) {
              return await tokenManager.getValidAccessToken();
            }
          } catch (e) {
            // Fall through to localStorage token
          }
          return localStorage.getItem('accessToken');
        };

        (async () => {
          const token = await resolveToken();
          const wsUrlWithAuth = token ? `${this.wsUrl}?token=${token}` : this.wsUrl;
          this.socket = new WebSocket(wsUrlWithAuth);
        
          this.socket.onopen = () => {
            console.log('🚀 Real-time connection established');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.fallbackMode = false;
            this._startHeartbeat();
            this._notifyListeners('connection_established', { connected: true });
            resolve();
          };
        
          this.socket.onmessage = (event) => {
            this._handleMessage(event);
          };
        
          this.socket.onerror = (error) => {
            console.error('❌ Real-time connection error:', error);
            this.isConnected = false;
            this._notifyListeners('connection_error', { error });
            if (!this.fallbackMode) {
              this._enableFallbackMode();
            }
            reject(error);
          };
        
          this.socket.onclose = (event) => {
            console.log('🔌 Real-time connection closed:', event.code);
            this.isConnected = false;
            this._stopHeartbeat();
            this._notifyListeners('connection_closed', { code: event.code });
            
            if (!this.fallbackMode && this.reconnectAttempts < this.maxReconnectAttempts) {
              this._attemptReconnect();
            } else if (!this.fallbackMode) {
              this._enableFallbackMode();
            }
          };
        })();
        
      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        this._enableFallbackMode();
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this._stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Subscribe to specific events
   */
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
    
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Send message to server
   */
  send(type, data = {}) {
    if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, ...data }));
      return true;
    } else {
      console.warn('⚠️ WebSocket not connected, message not sent:', { type, data });
      return false;
    }
  }

  /**
   * Start tracking application status
   */
  startApplicationTracking(applicationId) {
    this.send('subscribe_tracking', { application_ids: [applicationId] });
  }

  /**
   * Stop tracking application status
   */
  stopApplicationTracking(applicationId) {
    this.send('unsubscribe_tracking', { application_ids: [applicationId] });
  }

  /**
   * Request job matching update
   */
  requestJobMatching(userProfile) {
    this.send('request_job_matching', { profile: userProfile });
  }

  /**
   * Request analytics update
   */
  requestAnalyticsUpdate() {
    this.send('request_analytics_update', {});
  }

  /**
   * Handle incoming WebSocket messages
   */
  _handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      const { type, ...payload } = data;
      
      console.log('📨 Real-time message received:', type, payload);
      
      // Handle different message types
      switch (type) {
        case 'pong':
          // Heartbeat response
          break;
        case 'connection_established':
          this._notifyListeners('connection_established', payload);
          break;
        case 'application_status':
        case 'application_started':
        case 'application_completed':
        case 'application_failed':
          this._notifyListeners(this.events.APPLICATION_STATUS_CHANGE, payload);
          break;
        case 'job_match_update':
          this._notifyListeners(this.events.JOB_MATCH_UPDATE, payload);
          break;
        case 'analytics_update':
          this._notifyListeners(this.events.ANALYTICS_UPDATE, payload);
          break;
        case 'error':
          console.error('❌ Real-time error:', payload.message);
          this._notifyListeners('error', payload);
          break;
        default:
          console.warn('⚠️ Unknown message type:', type);
          this._notifyListeners(type, payload);
      }
    } catch (error) {
      console.error('❌ Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Attempt to reconnect to WebSocket server
   */
  _attemptReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('❌ Reconnection failed:', error);
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this._enableFallbackMode();
        }
      });
    }, delay);
  }

  /**
   * Enable fallback mode when WebSocket connection fails
   */
  _enableFallbackMode() {
    if (this.fallbackMode) return;
    
    this.fallbackMode = true;
    this.isConnected = false;
    console.warn('⚠️ WebSocket connection failed. Running in fallback mode without real-time updates.');
    
    // Clear any pending reconnect attempts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Notify listeners about fallback mode
    this._notifyListeners('fallback_mode_enabled', { 
      fallbackMode: true, 
      message: 'Real-time features disabled due to connection issues' 
    });
    
    // Optional: Implement polling fallback here
    this._startPollingFallback();
  }

  /**
   * Start polling fallback for critical updates
   */
  _startPollingFallback() {
    // Poll for critical updates every 30 seconds when WebSocket is unavailable
    this.pollingInterval = setInterval(() => {
      // You can implement API polling here for critical updates
      console.log('🔄 Polling for updates (fallback mode)');
    }, 30000);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  _startHeartbeat() {
    this._stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, 30000);
  }

  /**
   * Stop heartbeat
   */
  _stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Get WebSocket URL
   */
  _getWebSocketURL() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_HOST || 'localhost:8000';
  // Align with backend Channels routing for applications
  return `${protocol}//${host}/ws/applications/`;
  }

  /**
   * Notify all listeners for a specific event type
   */
  _notifyListeners(eventType, data) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      fallbackMode: this.fallbackMode,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }
}

// Create singleton instance
const realTimeService = new RealTimeService();

export default realTimeService;
