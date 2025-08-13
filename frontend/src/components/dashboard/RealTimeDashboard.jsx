/**
 * Real-Time Dashboard Component
 * 
 * Demonstrates all dynamic features:
 * - Live job matching scores
 * - Real-time application tracking
 * - Dynamic status updates
 * - Live analytics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Alert, AlertDescription } from '../ui/Alert';
import { 
  useRealTimeConnection, 
  useRealTimeJobMatching, 
  useDynamicApplications,
  useApplicationTracking,
  useLiveAnalytics,
  useSystemHealth
} from '../../hooks/useRealTime';
import Icon from '../AppIcon';

const RealTimeDashboard = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState('matching');
  
  // Real-time hooks
  const { isConnected, connectionStatus, error: connectionError, reconnect } = useRealTimeConnection();
  const { isMatching, matches, startMatching, stopMatching, getLiveScores } = useRealTimeJobMatching(userProfile);
  const { applications, applyDynamically, batchApply } = useDynamicApplications();
  const { trackingActive, trackingSummary, events, startTracking, stopTracking } = useApplicationTracking();
  const { analytics, startAutoRefresh, stopAutoRefresh } = useLiveAnalytics();
  const { health, checkHealth } = useSystemHealth();

  // Start auto-refresh for analytics
  useEffect(() => {
    if (isConnected) {
      startAutoRefresh(60000); // Every minute
    }
    return () => stopAutoRefresh();
  }, [isConnected, startAutoRefresh, stopAutoRefresh]);

  // Connection status indicator
  const ConnectionStatus = () => (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-3 h-3 rounded-full ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span className="text-sm font-medium">
        {connectionStatus === 'connected' ? 'Real-time Connected' : 
         connectionStatus === 'connecting' ? 'Connecting...' : 
         'Disconnected'}
      </span>
      {!isConnected && (
        <Button size="sm" variant="outline" onClick={reconnect}>
          Reconnect
        </Button>
      )}
    </div>
  );

  // Tab navigation
  const TabNavigation = () => (
    <div className="flex space-x-1 mb-6 bg-muted rounded-lg p-1">
      {[
        { id: 'matching', label: 'Job Matching', icon: 'Target' },
        { id: 'applications', label: 'Applications', icon: 'Send' },
        { id: 'tracking', label: 'Tracking', icon: 'Activity' },
        { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
        { id: 'system', label: 'System', icon: 'Settings' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === tab.id 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name={tab.icon} size={16} />
          {tab.label}
        </button>
      ))}
    </div>
  );

  // Job Matching Tab
  const JobMatchingTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Real-Time Job Matching</CardTitle>
              <CardDescription>
                AI-powered job matching with live score updates
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => getLiveScores()}
                variant="outline"
                size="sm"
              >
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Refresh Scores
              </Button>
              <Button 
                onClick={isMatching ? stopMatching : startMatching}
                variant={isMatching ? "destructive" : "default"}
              >
                <Icon name={isMatching ? "Square" : "Play"} size={16} className="mr-2" />
                {isMatching ? 'Stop Matching' : 'Start Matching'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isMatching && (
            <Alert className="mb-4">
              <Icon name="Zap" size={16} />
              <AlertDescription>
                Real-time matching is active. New job scores will update automatically.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            {matches.length > 0 ? (
              matches.slice(0, 10).map((match, index) => (
                <div key={match.job_id || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{match.job_title || 'Job Title'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {match.company || 'Company'} • {match.location || 'Location'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {Math.round((match.match_score || 0) * 100)}%
                      </div>
                      <Badge variant={match.match_score > 0.8 ? 'default' : 'secondary'}>
                        {match.match_score > 0.8 ? 'Excellent' : 
                         match.match_score > 0.6 ? 'Good' : 'Fair'} Match
                      </Badge>
                    </div>
                  </div>
                  <Progress value={(match.match_score || 0) * 100} className="mb-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Updated: {new Date(match.updated_at || Date.now()).toLocaleTimeString()}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => applyDynamically(match.job_id)}
                      disabled={!isConnected}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {isMatching ? 'Searching for matches...' : 'Start matching to see job recommendations'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Applications Tab
  const ApplicationsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dynamic Applications</CardTitle>
              <CardDescription>
                Real-time application processing with live status tracking
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                const topJobs = matches.slice(0, 3).map(m => m.job_id).filter(Boolean);
                if (topJobs.length > 0) {
                  batchApply(topJobs);
                }
              }}
              disabled={!isConnected || matches.length === 0}
            >
              <Icon name="Send" size={16} className="mr-2" />
              Apply to Top Matches
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.length > 0 ? (
              applications.map((app) => (
                <div key={app.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Application #{app.id}</h4>
                      <p className="text-sm text-muted-foreground">
                        Job ID: {app.jobId} • Applied: {new Date(app.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={
                      app.status === 'applied' ? 'default' :
                      app.status === 'interview' ? 'secondary' :
                      app.status === 'rejected' ? 'destructive' : 'outline'
                    }>
                      {app.status}
                    </Badge>
                  </div>
                  {app.lastUpdate && (
                    <p className="text-sm text-muted-foreground">
                      Last update: {new Date(app.lastUpdate).toLocaleString()}
                      {app.source && ` (${app.source})`}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No applications yet. Apply to jobs to see them here.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Tracking Tab
  const TrackingTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Application Tracking</CardTitle>
              <CardDescription>
                Real-time monitoring across email, ATS, and web sources
              </CardDescription>
            </div>
            <Button 
              onClick={trackingActive ? stopTracking : startTracking}
              variant={trackingActive ? "destructive" : "default"}
            >
              <Icon name={trackingActive ? "Square" : "Play"} size={16} className="mr-2" />
              {trackingActive ? 'Stop Tracking' : 'Start Tracking'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {trackingActive && (
            <Alert className="mb-4">
              <Icon name="Activity" size={16} />
              <AlertDescription>
                Live tracking is active. Status changes will appear in real-time.
              </AlertDescription>
            </Alert>
          )}
          
          {trackingSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold">{trackingSummary.active_applications || 0}</div>
                <div className="text-sm text-muted-foreground">Active Applications</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold">{events.length}</div>
                <div className="text-sm text-muted-foreground">Recent Events</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {trackingSummary.tracking_active ? 'Active' : 'Inactive'}
                </div>
                <div className="text-sm text-muted-foreground">Tracking Status</div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold">Recent Events</h4>
            {events.length > 0 ? (
              events.slice(0, 10).map((event) => (
                <div key={event.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="mb-1">
                        {event.type.replace('_', ' ')}
                      </Badge>
                      <p className="text-sm">
                        Application {event.application_id} 
                        {event.old_status && event.new_status && 
                          `: ${event.old_status} → ${event.new_status}`
                        }
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No recent events
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Analytics Tab
  const AnalyticsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Live Analytics</CardTitle>
          <CardDescription>
            Real-time metrics and performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold">{analytics.total_applications || 0}</div>
                <div className="text-sm text-muted-foreground">Total Applications</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold">{analytics.response_rate || 0}%</div>
                <div className="text-sm text-muted-foreground">Response Rate</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold">{analytics.interview_rate || 0}%</div>
                <div className="text-sm text-muted-foreground">Interview Rate</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold">{analytics.avg_response_time || 0}d</div>
                <div className="text-sm text-muted-foreground">Avg Response Time</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Loading analytics...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // System Tab
  const SystemTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Monitor dynamic services and system status
              </CardDescription>
            </div>
            <Button onClick={checkHealth} variant="outline">
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Check Health
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {health ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Job Matcher', status: health.jobmatcher, service: 'jobmatcher' },
                  { name: 'Job Applier', status: health.jobapplier, service: 'jobapplier' },
                  { name: 'Job Tracker', status: health.jobtracker, service: 'jobtracker' }
                ].map(service => (
                  <div key={service.service} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{service.name}</h4>
                      <Badge variant={service.status ? 'default' : 'destructive'}>
                        {service.status ? 'Healthy' : 'Error'}
                      </Badge>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      service.status ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                ))}
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Overall System Status</h4>
                <Badge variant={health.overall ? 'default' : 'destructive'}>
                  {health.overall ? 'All Systems Operational' : 'System Issues Detected'}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Loading system health...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Real-Time Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and control your dynamic job application system
        </p>
      </div>

      <ConnectionStatus />
      
      {connectionError && (
        <Alert className="mb-6" variant="destructive">
          <Icon name="AlertCircle" size={16} />
          <AlertDescription>
            Connection error: {connectionError.message}
          </AlertDescription>
        </Alert>
      )}

      <TabNavigation />

      {activeTab === 'matching' && <JobMatchingTab />}
      {activeTab === 'applications' && <ApplicationsTab />}
      {activeTab === 'tracking' && <TrackingTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'system' && <SystemTab />}
    </div>
  );
};

export default RealTimeDashboard;
