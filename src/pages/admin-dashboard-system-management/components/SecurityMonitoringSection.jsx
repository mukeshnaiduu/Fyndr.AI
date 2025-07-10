import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';

const SecurityMonitoringSection = () => {
  const [activeTab, setActiveTab] = useState('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');

  const [securityLogs, setSecurityLogs] = useState([
    {
      id: 1,
      timestamp: '2024-07-09 14:45:23',
      event: 'Failed login attempt',
      user: 'unknown@suspicious.com',
      ip: '192.168.1.100',
      severity: 'high',
      status: 'blocked',
      details: 'Multiple failed login attempts from same IP'
    },
    {
      id: 2,
      timestamp: '2024-07-09 14:30:15',
      event: 'Successful login',
      user: 'admin@hirehub.com',
      ip: '10.0.0.1',
      severity: 'low',
      status: 'allowed',
      details: 'Admin user logged in successfully'
    },
    {
      id: 3,
      timestamp: '2024-07-09 14:15:42',
      event: 'API rate limit exceeded',
      user: 'api-user@company.com',
      ip: '203.0.113.1',
      severity: 'medium',
      status: 'throttled',
      details: 'User exceeded API rate limit (1000 requests/hour)'
    },
    {
      id: 4,
      timestamp: '2024-07-09 13:58:30',
      event: 'Suspicious file upload',
      user: 'user@example.com',
      ip: '198.51.100.1',
      severity: 'high',
      status: 'quarantined',
      details: 'Uploaded file flagged by security scanner'
    }
  ]);

  const [threats, setThreats] = useState([
    {
      id: 1,
      type: 'Brute Force Attack',
      source: '192.168.1.100',
      target: 'Login System',
      severity: 'high',
      status: 'active',
      detectedAt: '2024-07-09 14:45:00',
      attempts: 25
    },
    {
      id: 2,
      type: 'SQL Injection Attempt',
      source: '203.0.113.50',
      target: 'User Database',
      severity: 'critical',
      status: 'blocked',
      detectedAt: '2024-07-09 12:30:00',
      attempts: 3
    },
    {
      id: 3,
      type: 'DDoS Attack',
      source: 'Multiple IPs',
      target: 'API Endpoints',
      severity: 'medium',
      status: 'mitigated',
      detectedAt: '2024-07-09 10:15:00',
      attempts: 1500
    }
  ]);

  const severityOptions = [
    { value: 'all', label: 'All Severities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const timeRangeOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const tabs = [
    { id: 'logs', label: 'Security Logs', icon: 'FileText', count: securityLogs.length },
    { id: 'threats', label: 'Threat Detection', icon: 'Shield', count: threats.length },
    { id: 'permissions', label: 'Permissions', icon: 'Lock', count: 0 },
    { id: 'audit', label: 'Audit Trail', icon: 'Eye', count: 0 }
  ];

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'text-success bg-success/10',
      medium: 'text-warning bg-warning/10',
      high: 'text-error bg-error/10',
      critical: 'text-error bg-error/20 border border-error/30'
    };
    return colors[severity] || 'text-muted-foreground bg-muted/10';
  };

  const getStatusColor = (status) => {
    const colors = {
      allowed: 'text-success bg-success/10',
      blocked: 'text-error bg-error/10',
      throttled: 'text-warning bg-warning/10',
      quarantined: 'text-error bg-error/10',
      active: 'text-error bg-error/10',
      mitigated: 'text-success bg-success/10'
    };
    return colors[status] || 'text-muted-foreground bg-muted/10';
  };

  const handleThreatAction = (threatId, action) => {
    console.log(`Threat action: ${action} for threat:`, threatId);
    setThreats(prev => prev.map(threat => 
      threat.id === threatId ? { ...threat, status: action } : threat
    ));
  };

  const renderLogsTab = () => {
    const filteredLogs = securityLogs.filter(log => {
      const matchesSearch = log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           log.ip.includes(searchQuery);
      const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;
      return matchesSearch && matchesSeverity;
    });

    return (
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div key={log.id} className="glassmorphic-surface p-4 rounded-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground">{log.event}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                      {log.severity}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-2">
                  <div>
                    <span className="font-medium">User:</span> {log.user}
                  </div>
                  <div>
                    <span className="font-medium">IP:</span> {log.ip}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {log.timestamp}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">{log.details}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log('View details:', log.id)}
                  iconName="Eye"
                >
                  Details
                </Button>
                {log.status === 'allowed' && log.severity === 'high' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => console.log('Block IP:', log.ip)}
                    iconName="Ban"
                  >
                    Block IP
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderThreatsTab = () => (
    <div className="space-y-4">
      {threats.map((threat) => (
        <div key={threat.id} className="glassmorphic-surface p-4 rounded-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-foreground">{threat.type}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                    {threat.severity}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(threat.status)}`}>
                    {threat.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-2">
                <div>
                  <span className="font-medium">Source:</span> {threat.source}
                </div>
                <div>
                  <span className="font-medium">Target:</span> {threat.target}
                </div>
                <div>
                  <span className="font-medium">Detected:</span> {threat.detectedAt}
                </div>
                <div>
                  <span className="font-medium">Attempts:</span> {threat.attempts}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log('Investigate threat:', threat.id)}
                iconName="Search"
              >
                Investigate
              </Button>
              {threat.status === 'active' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleThreatAction(threat.id, 'blocked')}
                  iconName="Shield"
                >
                  Block
                </Button>
              )}
              {threat.status === 'blocked' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleThreatAction(threat.id, 'mitigated')}
                  iconName="CheckCircle"
                >
                  Resolve
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="text-center py-12">
      <Icon name="Lock" size={48} className="text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">Permission Management</h3>
      <p className="text-muted-foreground mb-4">Manage user roles and access permissions</p>
      <Button iconName="Settings">Configure Permissions</Button>
    </div>
  );

  const renderAuditTab = () => (
    <div className="text-center py-12">
      <Icon name="Eye" size={48} className="text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">Audit Trail</h3>
      <p className="text-muted-foreground mb-4">Track all administrative actions and changes</p>
      <Button iconName="Download">Export Audit Log</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Security Monitoring</h3>
          <p className="text-sm text-muted-foreground">
            Monitor security events and manage platform security
          </p>
        </div>
        <Button iconName="Shield" iconPosition="left" variant="destructive">
          Emergency Lock
        </Button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glassmorphic-surface p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Threats</span>
            <Icon name="AlertTriangle" size={16} className="text-error" />
          </div>
          <div className="text-2xl font-bold text-error">3</div>
        </div>
        
        <div className="glassmorphic-surface p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Blocked IPs</span>
            <Icon name="Ban" size={16} className="text-warning" />
          </div>
          <div className="text-2xl font-bold text-warning">127</div>
        </div>
        
        <div className="glassmorphic-surface p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Failed Logins</span>
            <Icon name="XCircle" size={16} className="text-error" />
          </div>
          <div className="text-2xl font-bold text-error">45</div>
        </div>
        
        <div className="glassmorphic-surface p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Security Score</span>
            <Icon name="Shield" size={16} className="text-success" />
          </div>
          <div className="text-2xl font-bold text-success">98%</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glassmorphic-surface p-1 rounded-lg">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/30' :'text-muted-foreground hover:text-foreground hover:bg-white/10'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {(activeTab === 'logs' || activeTab === 'threats') && (
        <div className="glassmorphic-surface p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="search"
              placeholder="Search security events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select
              options={severityOptions}
              value={selectedSeverity}
              onChange={setSelectedSeverity}
              placeholder="Filter by severity"
            />
            <Select
              options={timeRangeOptions}
              value={timeRange}
              onChange={setTimeRange}
              placeholder="Time range"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="glassmorphic-card p-6">
        {activeTab === 'logs' && renderLogsTab()}
        {activeTab === 'threats' && renderThreatsTab()}
        {activeTab === 'permissions' && renderPermissionsTab()}
        {activeTab === 'audit' && renderAuditTab()}
      </div>
    </div>
  );
};

export default SecurityMonitoringSection;
