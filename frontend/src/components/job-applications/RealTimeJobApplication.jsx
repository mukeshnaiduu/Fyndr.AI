import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import ApplicationMonitor from './ApplicationMonitor';
import jobApplicationService from '../../services/jobApplicationService';

const RealTimeJobApplication = ({ job, onApplicationComplete, onStatusUpdate }) => {
  const [applicationStage, setApplicationStage] = useState('ready'); // ready, applying, completed, failed
  const [applicationProgress, setApplicationProgress] = useState(0);
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [isMyWorkday, setIsMyWorkday] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState(null);

  // Check if job is from MyWorkday
  useEffect(() => {
    if (job?.url) {
      const isWorkday = job.url.toLowerCase().includes('workday') || 
                       job.url.toLowerCase().includes('myworkday') ||
                       job.source?.toLowerCase().includes('workday');
      setIsMyWorkday(isWorkday);
    }
  }, [job]);

  // Add timeline entry
  const addTimelineEntry = useCallback((event, message, details = null) => {
    setTimeline(prev => [{
      id: Date.now(),
      timestamp: new Date().toISOString(),
      event,
      message,
      details
    }, ...prev]);
  }, []);

  // Apply to job using centralized service (dynamic API will fallback if unavailable)
  const applyToJob = useCallback(async () => {
    try {
      setApplicationStage('applying');
      setApplicationProgress(0);
      setError(null);
      
      addTimelineEntry('application_started', 'Starting dynamic job application...');
      setApplicationProgress(10);

      // Prepare application options
      const options = {
        applicationMode: (job?.url && !job.url.startsWith('/')) ? 'browser' : 'manual',
        autoCustomize: true,
        followExternalLinks: true,
        notes: `Applied through Fyndr.AI${isMyWorkday ? ' with MyWorkday integration' : ''}`
      };

      addTimelineEntry('options_prepared', 'Application options configured', options);
      setApplicationProgress(20);

      // Submit application via centralized service (hits /api/applications/apply/<job_id>/)
      const result = await jobApplicationService.applyToJob(job.id, options);

  if (result.success) {
        setApplicationProgress(70);
        addTimelineEntry('application_processing', 'Processing application...', {
          external_link_followed: result.external_link_followed,
          confirmation_number: result.confirmation_number
        });

        // Update application details
        setApplicationDetails(result);
        
        setApplicationProgress(90);

  setApplicationProgress(100);
  setApplicationStage('completed');
        
        addTimelineEntry('application_completed', 'Application submitted successfully!', {
          confirmation_number: result.confirmation_number,
          application_id: result.application_id
        });

        // Notify parent component
        if (onApplicationComplete) {
          onApplicationComplete(result);
        }

  } else {
        throw new Error(result.error || result.message || 'Application failed');
      }

    } catch (error) {
      console.error('Application failed:', error);
      setError(error.message);
      setApplicationStage('failed');
      addTimelineEntry('application_failed', `Application failed: ${error.message}`);
    }
  }, [job, isMyWorkday, addTimelineEntry, onApplicationComplete]);

  const getStageIcon = (stage) => {
    const icons = {
      'ready': 'Play',
      'applying': 'Loader',
      'completed': 'CheckCircle',
      'failed': 'XCircle'
    };
    return icons[stage] || 'Circle';
  };

  const getStageColor = (stage) => {
    const colors = {
      'ready': 'text-blue-500',
      'applying': 'text-yellow-500',
      'completed': 'text-green-500',
      'failed': 'text-red-500'
    };
    return colors[stage] || 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Main Application Card */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-medium">Real-Time Job Application</h3>
              <p className="text-sm text-muted-foreground">
                {job?.title} at {job?.company?.name}
              </p>
            </div>
            
            {isMyWorkday && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Icon name="Zap" size={12} />
                <span>MyWorkday Integration</span>
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Application Status */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Icon 
                name={getStageIcon(applicationStage)} 
                size={20} 
                className={`${getStageColor(applicationStage)} ${applicationStage === 'applying' ? 'animate-spin' : ''}`}
              />
              <div>
                <p className="font-medium capitalize">
                  {applicationStage === 'ready' && 'Ready to Apply'}
                  {applicationStage === 'applying' && 'Applying...'}
                  {applicationStage === 'completed' && 'Application Completed'}
                  {applicationStage === 'failed' && 'Application Failed'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {applicationStage === 'ready' && 'Click apply to start the automated process'}
                  {applicationStage === 'applying' && 'Processing your application in real-time'}
                  {applicationStage === 'completed' && 'Your application has been successfully submitted'}
                  {applicationStage === 'failed' && 'There was an error submitting your application'}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            {applicationStage === 'applying' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Application Progress</span>
                  <span>{applicationProgress}%</span>
                </div>
                <Progress value={applicationProgress} className="h-2" />
              </div>
            )}
            
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="AlertCircle" size={16} className="text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Application Error</p>
                    <p className="text-sm text-destructive/80">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Application Details */}
            {applicationDetails && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <h4 className="text-sm font-medium">Application Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Application ID:</span>
                    <p className="font-mono">{applicationDetails.application_id?.slice(-8)}</p>
                  </div>
                  {applicationDetails.confirmation_number && (
                    <div>
                      <span className="text-muted-foreground">Confirmation:</span>
                      <p className="font-mono">{applicationDetails.confirmation_number}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Method:</span>
                    <p>{applicationDetails.external_link_followed ? 'External Form' : 'Internal'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Documents:</span>
                    <p>{applicationDetails.documents_customized ? 'Customized' : 'Standard'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Button */}
          <div className="flex justify-center">
            {applicationStage === 'ready' && (
              <Button
                onClick={applyToJob}
                size="lg"
                className="min-w-40"
                iconName="Send"
                iconPosition="left"
              >
                {isMyWorkday ? 'Apply via MyWorkday' : 'Apply Now'}
              </Button>
            )}
            
            {applicationStage === 'failed' && (
              <Button
                onClick={applyToJob}
                variant="outline"
                size="lg"
                className="min-w-40"
                iconName="RotateCcw"
                iconPosition="left"
              >
                Retry Application
              </Button>
            )}
            
            {applicationStage === 'completed' && (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Icon name="CheckCircle" size={20} />
                  <span className="font-medium">Application Submitted Successfully!</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You'll receive updates as your application progresses.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Timeline */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader>
            <h4 className="text-lg font-medium flex items-center space-x-2">
              <Icon name="Clock" size={16} />
              <span>Application Timeline</span>
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-start space-x-3 pb-4 ${
                    index < timeline.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{entry.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    {entry.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          View Details
                        </summary>
                        <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Application Monitor */}
      {applicationDetails?.application_id && (
        <ApplicationMonitor
          applicationId={applicationDetails.application_id}
          onStatusUpdate={onStatusUpdate}
        />
      )}
    </div>
  );
};

export default RealTimeJobApplication;
