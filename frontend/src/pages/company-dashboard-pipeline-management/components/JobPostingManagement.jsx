import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import recruiterAPI from '../../../services/recruiterAPI';
import { useRealTime } from '../../../hooks/useRealTime';

const JobPostingManagement = ({ onSelectJob = () => { }, selectedJobId = null }) => {
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('all');

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success/20 text-success',
      paused: 'bg-warning/20 text-warning',
      draft: 'bg-muted/20 text-muted-foreground',
      closed: 'bg-error/20 text-error'
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: 'Play',
      paused: 'Pause',
      draft: 'Edit',
      closed: 'X'
    };
    return icons[status] || 'Edit';
  };

  const mapStatus = useCallback((job) => (job?.is_active ? 'active' : 'paused'), []);

  const filteredJobs = useMemo(() => (
    jobPostings.filter(job => {
      if (activeTab === 'all') return true;
      return mapStatus(job) === activeTab;
    })
  ), [jobPostings, activeTab, mapStatus]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruiterAPI.listJobs({ ordering: '-created_at', page_size: 50 });
      const results = res.results || res || [];
      setJobPostings(results);
    } catch (e) {
      setError(e?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleJobAction = async (jobId, action) => {
    if (action === 'pause' || action === 'activate') {
      try {
        const job = jobPostings.find(j => j.id === jobId);
        if (!job) return;
        const updated = await recruiterAPI.updateJob(jobId, { is_active: action === 'activate' });
        setJobPostings(prev => prev.map(j => j.id === jobId ? { ...j, ...updated } : j));
      } catch (e) {
        console.error('Failed to update job status', e);
      }
    } else if (action === 'delete') {
      try {
        await recruiterAPI.deleteJob(jobId);
        setJobPostings(prev => prev.filter(j => j.id !== jobId));
      } catch (e) {
        console.error('Failed to delete job', e);
      }
    } else {
      console.log(`${action} job ${jobId}`);
    }
  };

  // Real-time subscriptions for job events
  const { on, off } = useRealTime();
  useEffect(() => {
    fetchJobs();

    const onJobCreated = (payload) => {
      const data = payload?.job || payload;
      if (!data?.id) return;
      setJobPostings(prev => {
        const exists = prev.some(j => j.id === data.id);
        return exists ? prev.map(j => (j.id === data.id ? { ...j, ...data } : j)) : [data, ...prev];
      });
    };

    const onJobUpdated = (payload) => {
      const data = payload?.job || payload;
      if (!data?.id) return;
      setJobPostings(prev => prev.map(j => (j.id === data.id ? { ...j, ...data } : j)));
    };

    on('job_created', onJobCreated);
    on('job_updated', onJobUpdated);

    return () => {
      off('job_created', onJobCreated);
      off('job_updated', onJobUpdated);
    };
  }, [fetchJobs, on, off]);

  const tabs = [
    { id: 'all', label: 'All Jobs', count: jobPostings.length },
    { id: 'active', label: 'Active', count: jobPostings.filter(j => mapStatus(j) === 'active').length },
    { id: 'paused', label: 'Paused', count: jobPostings.filter(j => mapStatus(j) === 'paused').length }
  ];

  return (
    <div className="glassmorphic-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Job Postings</h2>
        <Button
          variant="default"
          iconName="Plus"
          iconPosition="left"
          onClick={() => handleJobAction(null, 'create')}
        >
          Post New Job
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 glassmorphic-surface rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
              }`}
          >
            <span>{tab.label}</span>
            <span className="bg-current/20 text-current px-2 py-0.5 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {loading && (
          <div className="text-sm text-muted-foreground">Loading jobs…</div>
        )}
        {error && (
          <div className="text-sm text-error">{error}</div>
        )}
        {!loading && !error && filteredJobs.map((job) => (
          <div
            key={job.id}
            className={`glassmorphic-surface p-4 rounded-lg hover:bg-white/10 transition-all duration-200 ${selectedJobId === job.id ? 'ring-2 ring-primary/50' : ''}`}
            onClick={(e) => {
              // avoid triggering when clicking inner action buttons
              const tag = (e.target?.tagName || '').toLowerCase();
              if (['button', 'svg', 'path'].includes(tag)) return;
              onSelectJob(job.id);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectJob(job.id); }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-foreground cursor-pointer" onClick={() => onSelectJob(job.id)}>
                    {job.title || 'Untitled'}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(mapStatus(job))}`}>
                    <Icon name={getStatusIcon(mapStatus(job))} size={12} />
                    <span className="capitalize">{mapStatus(job)}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center space-x-1">
                    <Icon name="MapPin" size={14} />
                    <span>{job.location || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={14} />
                    <span>{job.employment_type || job.type || 'Full-time'}</span>
                  </div>
                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center space-x-1">
                      <Icon name="DollarSign" size={14} />
                      <span>${job.salary_min?.toLocaleString?.() || '—'} - ${job.salary_max?.toLocaleString?.() || '—'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="Eye"
                  onClick={(e) => { e.stopPropagation(); onSelectJob(job.id); }}
                  className="hover:bg-white/10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="Edit"
                  onClick={(e) => { e.stopPropagation(); handleJobAction(job.id, 'edit'); }}
                  className="hover:bg-white/10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="MoreHorizontal"
                  onClick={(e) => { e.stopPropagation(); handleJobAction(job.id, 'more'); }}
                  className="hover:bg-white/10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm">
                {job.applications_count != null && (
                  <div className="flex items-center space-x-2">
                    <Icon name="Users" size={16} className="text-primary" />
                    <span className="text-foreground font-medium">{job.applications_count}</span>
                    <span className="text-muted-foreground">applications</span>
                  </div>
                )}
                {job.date_posted && (
                  <div className="flex items-center space-x-2">
                    <Icon name="Calendar" size={16} className="text-warning" />
                    <span className="text-muted-foreground">Posted: {new Date(job.date_posted).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {mapStatus(job) === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Pause"
                    onClick={(e) => { e.stopPropagation(); handleJobAction(job.id, 'pause'); }}
                  >
                    Pause
                  </Button>
                )}
                {mapStatus(job) === 'paused' && (
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Play"
                    onClick={(e) => { e.stopPropagation(); handleJobAction(job.id, 'activate'); }}
                  >
                    Activate
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  iconName="Users"
                  onClick={(e) => { e.stopPropagation(); onSelectJob(job.id); }}
                >
                  View Applicants
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && !error && filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Briefcase" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No jobs found</h3>
          <p className="text-muted-foreground mb-4">{activeTab === 'all' ? 'Create your first job posting' : `No ${activeTab} jobs available`}</p>
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={() => handleJobAction(null, 'create')}
          >
            Post New Job
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobPostingManagement;
