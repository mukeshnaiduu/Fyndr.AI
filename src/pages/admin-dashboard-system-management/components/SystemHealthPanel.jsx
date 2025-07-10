import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';

const SystemHealthPanel = () => {
  const [systemMetrics, setSystemMetrics] = useState({
    serverStatus: 'healthy',
    databasePerformance: 95,
    apiResponseTime: 120,
    uptime: '99.9%',
    activeUsers: 1247,
    memoryUsage: 68,
    cpuUsage: 45,
    diskSpace: 78
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      message: 'High memory usage detected on server-02',
      timestamp: '2 minutes ago',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      message: 'Database backup completed successfully',
      timestamp: '15 minutes ago',
      severity: 'low'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        apiResponseTime: Math.floor(Math.random() * 50) + 100,
        memoryUsage: Math.floor(Math.random() * 20) + 60,
        cpuUsage: Math.floor(Math.random() * 30) + 30,
        activeUsers: Math.floor(Math.random() * 100) + 1200
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      healthy: 'text-success',
      warning: 'text-warning',
      critical: 'text-error'
    };
    return colors[status] || 'text-muted-foreground';
  };

  const getStatusBg = (status) => {
    const backgrounds = {
      healthy: 'bg-success/10',
      warning: 'bg-warning/10',
      critical: 'bg-error/10'
    };
    return backgrounds[status] || 'bg-muted/10';
  };

  const getMetricColor = (value, threshold = 80) => {
    if (value >= threshold) return 'text-error';
    if (value >= threshold * 0.7) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="glassmorphic-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
            <Icon name="Activity" size={20} className="text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">System Health</h3>
            <p className="text-sm text-muted-foreground">Real-time monitoring</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBg(systemMetrics.serverStatus)} ${getStatusColor(systemMetrics.serverStatus)}`}>
          {systemMetrics.serverStatus.toUpperCase()}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glassmorphic-surface p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Uptime</span>
            <Icon name="Clock" size={16} className="text-success" />
          </div>
          <div className="text-xl font-bold text-foreground">{systemMetrics.uptime}</div>
        </div>

        <div className="glassmorphic-surface p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Users</span>
            <Icon name="Users" size={16} className="text-primary" />
          </div>
          <div className="text-xl font-bold text-foreground">{systemMetrics.activeUsers.toLocaleString()}</div>
        </div>

        <div className="glassmorphic-surface p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">API Response</span>
            <Icon name="Zap" size={16} className={getMetricColor(systemMetrics.apiResponseTime, 200)} />
          </div>
          <div className={`text-xl font-bold ${getMetricColor(systemMetrics.apiResponseTime, 200)}`}>
            {systemMetrics.apiResponseTime}ms
          </div>
        </div>

        <div className="glassmorphic-surface p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">DB Performance</span>
            <Icon name="Database" size={16} className="text-accent" />
          </div>
          <div className="text-xl font-bold text-foreground">{systemMetrics.databasePerformance}%</div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium text-foreground">Resource Usage</h4>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Memory Usage</span>
              <span className={`text-sm font-medium ${getMetricColor(systemMetrics.memoryUsage)}`}>
                {systemMetrics.memoryUsage}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  systemMetrics.memoryUsage >= 80 ? 'bg-error' : 
                  systemMetrics.memoryUsage >= 60 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${systemMetrics.memoryUsage}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">CPU Usage</span>
              <span className={`text-sm font-medium ${getMetricColor(systemMetrics.cpuUsage)}`}>
                {systemMetrics.cpuUsage}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  systemMetrics.cpuUsage >= 80 ? 'bg-error' : 
                  systemMetrics.cpuUsage >= 60 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${systemMetrics.cpuUsage}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Disk Space</span>
              <span className={`text-sm font-medium ${getMetricColor(systemMetrics.diskSpace)}`}>
                {systemMetrics.diskSpace}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  systemMetrics.diskSpace >= 80 ? 'bg-error' : 
                  systemMetrics.diskSpace >= 60 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${systemMetrics.diskSpace}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-foreground">Recent Alerts</h4>
          <button className="text-xs text-primary hover:text-primary/80 transition-colors">
            View All
          </button>
        </div>
        
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start space-x-3 p-3 glassmorphic-surface rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                alert.type === 'warning' ? 'bg-warning' : 
                alert.type === 'error' ? 'bg-error' : 'bg-primary'
              }`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                alert.severity === 'high' ? 'bg-error/20 text-error' :
                alert.severity === 'medium'? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
              }`}>
                {alert.severity}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemHealthPanel;
