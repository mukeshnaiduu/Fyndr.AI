import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import jobApplicationService from 'services/jobApplicationService';

const BatchApplicationModal = ({ isOpen, onClose, selectedJobs = [], onSuccess }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [batchProgress, setBatchProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [settings, setSettings] = useState({
    maxConcurrent: 3,
    delayBetweenApplications: 30,
    autoCustormize: true,
    followExternalLinks: true
  });

  useEffect(() => {
    if (!isOpen) {
      setBatchProgress(null);
      setResults(null);
    }
  }, [isOpen]);

  const handleBatchApply = async () => {
    if (selectedJobs.length === 0) return;

    setIsApplying(true);
    setBatchProgress({ 
      total: selectedJobs.length,
      completed: 0,
      current: 'Initializing batch application...',
      applications: []
    });

    try {
      const jobIds = selectedJobs.map(job => job.id);
      
      // Start batch application
      const result = await jobApplicationService.applyToMultipleJobs(jobIds, settings);
      
      setResults(result);
      setBatchProgress(prev => ({
        ...prev,
        completed: result.results?.total_jobs || 0,
        current: 'Batch application completed!'
      }));

      if (onSuccess) {
        onSuccess(result);
      }

    } catch (error) {
      console.error('Batch application failed:', error);
      setBatchProgress(prev => ({
        ...prev,
        current: `Error: ${error.message}`,
        error: true
      }));
    } finally {
      setIsApplying(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glassmorphic max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-squircle">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-heading-bold text-foreground">
              Batch Application
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted/20 rounded-full transition-colors"
              disabled={isApplying}
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Selected Jobs Summary */}
          <div className="mb-6 p-4 bg-muted/10 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              Selected Jobs ({selectedJobs.length})
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedJobs.slice(0, 5).map(job => (
                <div key={job.id} className="flex items-center space-x-2 text-sm">
                  <Icon name="Briefcase" size={14} className="text-muted-foreground" />
                  <span className="font-medium">{job.title}</span>
                  <span className="text-muted-foreground">at {job.company}</span>
                </div>
              ))}
              {selectedJobs.length > 5 && (
                <div className="text-sm text-muted-foreground">
                  ... and {selectedJobs.length - 5} more jobs
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          {!isApplying && !results && (
            <div className="mb-6 space-y-4">
              <h3 className="font-semibold text-foreground">Application Settings</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Max Concurrent Applications
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.maxConcurrent}
                    onChange={(e) => handleSettingChange('maxConcurrent', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Delay Between Applications (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={settings.delayBetweenApplications}
                    onChange={(e) => handleSettingChange('delayBetweenApplications', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.autoCustormize}
                    onChange={(e) => handleSettingChange('autoCustormize', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-foreground">Auto-customize resume and cover letter</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.followExternalLinks}
                    onChange={(e) => handleSettingChange('followExternalLinks', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-foreground">Follow external application links</span>
                </label>
              </div>
            </div>
          )}

          {/* Progress */}
          {batchProgress && (
            <div className="mb-6 p-4 bg-background/50 rounded-lg border border-border">
              <div className="flex items-center space-x-2 mb-3">
                {isApplying ? (
                  <Icon name="Loader" size={16} className="text-primary animate-spin" />
                ) : batchProgress.error ? (
                  <Icon name="XCircle" size={16} className="text-error" />
                ) : (
                  <Icon name="CheckCircle" size={16} className="text-success" />
                )}
                <span className="font-medium text-foreground">
                  {batchProgress.current}
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(batchProgress.completed / batchProgress.total) * 100}%` 
                  }}
                ></div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {batchProgress.completed} of {batchProgress.total} applications processed
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="mb-6 space-y-4">
              <h3 className="font-semibold text-foreground">Application Results</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success">
                    {results.results?.successful_applications || 0}
                  </div>
                  <div className="text-sm text-success">Successful</div>
                </div>
                
                <div className="text-center p-3 bg-error/10 rounded-lg">
                  <div className="text-2xl font-bold text-error">
                    {results.results?.failed_applications || 0}
                  </div>
                  <div className="text-sm text-error">Failed</div>
                </div>
                
                <div className="text-center p-3 bg-muted/10 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {results.results?.total_jobs || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>

              {results.results?.applications && results.results.applications.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {results.results.applications.map((app, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/5 rounded">
                      <span className="text-sm text-foreground">
                        Job #{app.job_id}
                      </span>
                      <div className="flex items-center space-x-2">
                        {app.success ? (
                          <>
                            <Icon name="CheckCircle" size={14} className="text-success" />
                            <span className="text-sm text-success">Applied</span>
                          </>
                        ) : (
                          <>
                            <Icon name="XCircle" size={14} className="text-error" />
                            <span className="text-sm text-error">Failed</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isApplying}
            >
              {results ? 'Close' : 'Cancel'}
            </Button>
            
            {!results && (
              <Button
                variant="default"
                onClick={handleBatchApply}
                loading={isApplying}
                disabled={selectedJobs.length === 0}
                iconName="Send"
                iconPosition="left"
              >
                Apply to {selectedJobs.length} Jobs
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchApplicationModal;
