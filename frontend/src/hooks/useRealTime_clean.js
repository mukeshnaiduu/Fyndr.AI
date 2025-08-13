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
