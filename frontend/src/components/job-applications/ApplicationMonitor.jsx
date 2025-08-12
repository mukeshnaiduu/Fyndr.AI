import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

const ApplicationMonitor = ({ applicationId, onStatusUpdate }) => {
  const [monitoringData, setMonitoringData] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/jobapplier/start-monitoring/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ application_id: applicationId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsMonitoring(true);
        
        // Start polling for updates
        startPolling();
        
        // Add real-time update
        setRealTimeUpdates(prev => [{
          id: Date.now(),
          timestamp: new Date().toISOString(),
          event: 'monitoring_started',
          message: 'Real-time monitoring activated'
        }, ...prev]);
      }
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  // Stop monitoring
  const stopMonitoring = useCallback(async () => {
    try {
      const response = await fetch('/api/jobapplier/stop-monitoring/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ application_id: applicationId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsMonitoring(false);
        
        // Add real-time update
        setRealTimeUpdates(prev => [{
          id: Date.now(),
          timestamp: new Date().toISOString(),
          event: 'monitoring_stopped',
          message: 'Real-time monitoring deactivated'
        }, ...prev]);
      }
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  }, [applicationId]);

  // Poll for status updates
  const pollForUpdates = useCallback(async () => {
    if (!isMonitoring) return;
    
    try {
      const response = await fetch(`/api/jobapplier/monitor-status/${applicationId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMonitoringData(result);
        
        // Check for new status updates
        if (result.status_updates && result.status_updates.length > 0) {
          result.status_updates.forEach(update => {
            setRealTimeUpdates(prev => [{
              id: Date.now() + Math.random(),
              timestamp: new Date().toISOString(),
              event: 'status_update',
              message: `Status changed to: ${update.status}`,
              details: update
            }, ...prev]);
            
            // Notify parent component
            if (onStatusUpdate) {
              onStatusUpdate(update);
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to poll for updates:', error);
    }
  }, [applicationId, isMonitoring, onStatusUpdate]);

  // Start polling interval
  const startPolling = useCallback(() => {
    const interval = setInterval(pollForUpdates, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [pollForUpdates]);

  // Initialize monitoring status
  useEffect(() => {
    const checkMonitoringStatus = async () => {
      try {
        const response = await fetch(`/api/jobapplier/monitor-status/${applicationId}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        const result = await response.json();
        
        if (result.success && result.monitoring_data?.monitoring_active) {
          setIsMonitoring(true);
          setMonitoringData(result);
          startPolling();
        }
      } catch (error) {
        console.error('Failed to check monitoring status:', error);
      }
    };
    
    if (applicationId) {
      checkMonitoringStatus();
    }
  }, [applicationId, startPolling]);

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-500',
      'applied': 'bg-blue-500',
      'interview': 'bg-purple-500',
      'offer': 'bg-green-500',
      'rejected': 'bg-red-500',
      'withdrawn': 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': 'Clock',
      'applied': 'Send',
      'interview': 'Video',
      'offer': 'Gift',
      'rejected': 'X',
      'withdrawn': 'Minus'
    };
    return icons[status] || 'Circle';
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Application Monitor</h3>
          <p className="text-sm text-muted-foreground">
            Real-time tracking for application {applicationId?.slice(-8)}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {isMonitoring && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600">Live</span>
            </div>
          )}
          
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            size="sm"
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            disabled={loading}
            iconName={isMonitoring ? "Square" : "Play"}
            iconPosition="left"
          >
            {loading ? 'Processing...' : isMonitoring ? 'Stop' : 'Start'} Monitoring
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Status */}
        {monitoringData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full ${getStatusColor(monitoringData.current_status)} flex items-center justify-center`}>
                  <Icon 
                    name={getStatusIcon(monitoringData.current_status)} 
                    size={16} 
                    className="text-white" 
                  />
                </div>
                <div>
                  <p className="font-medium capitalize">
                    {monitoringData.current_status.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(monitoringData.last_updated).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <Badge variant="secondary" className="capitalize">
                {monitoringData.current_status}
              </Badge>
            </div>
            
            {/* Monitoring Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Monitoring Progress</span>
                <span>Active</span>
              </div>
              <Progress value={isMonitoring ? 100 : 0} className="h-2" />
            </div>
          </div>
        )}
        
        {/* Real-time Updates Feed */}
        {realTimeUpdates.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center space-x-2">
              <Icon name="Activity" size={16} />
              <span>Live Updates</span>
            </h4>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {realTimeUpdates.slice(0, 10).map((update) => (
                <div
                  key={update.id}
                  className="flex items-start space-x-3 p-3 bg-background border border-border rounded-lg text-sm"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground">{update.message}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(update.timestamp).toLocaleString()}
                    </p>
                    {update.details && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {JSON.stringify(update.details, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Status History */}
        {statusHistory.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center space-x-2">
              <Icon name="History" size={16} />
              <span>Status History</span>
            </h4>
            
            <div className="space-y-2">
              {statusHistory.map((status, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-2 bg-muted rounded-lg"
                >
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)}`}></div>
                  <div className="flex-1">
                    <span className="text-sm font-medium capitalize">
                      {status.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(status.updated_at).toLocaleString()}
                    </span>
                  </div>
                  <Badge variant="outline" size="sm">
                    {status.source}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Monitoring Instructions */}
        {!isMonitoring && (
          <div className="text-center py-6 text-muted-foreground">
            <Icon name="MonitorSpeaker" size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              Start monitoring to track real-time status updates for this application.
            </p>
            <p className="text-xs mt-2">
              We'll check for updates from email, ATS systems, and other sources.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApplicationMonitor;
