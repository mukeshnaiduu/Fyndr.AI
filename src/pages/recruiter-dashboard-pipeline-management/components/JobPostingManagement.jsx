import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const JobPostingManagement = () => {
  const [jobPostings] = useState([
    {
      id: 1,
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'New York, NY',
      type: 'Full-time',
      status: 'active',
      applications: 45,
      views: 234,
      postedDate: '2025-01-05',
      deadline: '2025-02-05',
      salary: '$120,000 - $150,000'
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'active',
      applications: 32,
      views: 189,
      postedDate: '2025-01-04',
      deadline: '2025-02-04',
      salary: '$110,000 - $140,000'
    },
    {
      id: 3,
      title: 'Backend Developer',
      department: 'Engineering',
      location: 'Austin, TX',
      type: 'Full-time',
      status: 'paused',
      applications: 28,
      views: 156,
      postedDate: '2025-01-03',
      deadline: '2025-02-03',
      salary: '$100,000 - $130,000'
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      department: 'Infrastructure',
      location: 'Seattle, WA',
      type: 'Contract',
      status: 'draft',
      applications: 0,
      views: 0,
      postedDate: '2025-01-02',
      deadline: '2025-02-02',
      salary: '$90,000 - $120,000'
    }
  ]);

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

  const filteredJobs = jobPostings.filter(job => {
    if (activeTab === 'all') return true;
    return job.status === activeTab;
  });

  const handleJobAction = (jobId, action) => {
    console.log(`${action} job ${jobId}`);
  };

  const tabs = [
    { id: 'all', label: 'All Jobs', count: jobPostings.length },
    { id: 'active', label: 'Active', count: jobPostings.filter(j => j.status === 'active').length },
    { id: 'paused', label: 'Paused', count: jobPostings.filter(j => j.status === 'paused').length },
    { id: 'draft', label: 'Draft', count: jobPostings.filter(j => j.status === 'draft').length }
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
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-primary/20 text-primary' :'text-muted-foreground hover:text-foreground hover:bg-white/10'
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
        {filteredJobs.map((job) => (
          <div key={job.id} className="glassmorphic-surface p-4 rounded-lg hover:bg-white/10 transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-foreground">{job.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(job.status)}`}>
                    <Icon name={getStatusIcon(job.status)} size={12} />
                    <span className="capitalize">{job.status}</span>
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center space-x-1">
                    <Icon name="Building" size={14} />
                    <span>{job.department}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="MapPin" size={14} />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={14} />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="DollarSign" size={14} />
                    <span>{job.salary}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="Eye"
                  onClick={() => handleJobAction(job.id, 'view')}
                  className="hover:bg-white/10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="Edit"
                  onClick={() => handleJobAction(job.id, 'edit')}
                  className="hover:bg-white/10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="MoreHorizontal"
                  onClick={() => handleJobAction(job.id, 'more')}
                  className="hover:bg-white/10"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Icon name="Users" size={16} className="text-primary" />
                  <span className="text-foreground font-medium">{job.applications}</span>
                  <span className="text-muted-foreground">applications</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Eye" size={16} className="text-accent" />
                  <span className="text-foreground font-medium">{job.views}</span>
                  <span className="text-muted-foreground">views</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Calendar" size={16} className="text-warning" />
                  <span className="text-muted-foreground">Deadline: {job.deadline}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {job.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Pause"
                    onClick={() => handleJobAction(job.id, 'pause')}
                  >
                    Pause
                  </Button>
                )}
                {job.status === 'paused' && (
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Play"
                    onClick={() => handleJobAction(job.id, 'activate')}
                  >
                    Activate
                  </Button>
                )}
                {job.status === 'draft' && (
                  <Button
                    variant="default"
                    size="sm"
                    iconName="Send"
                    onClick={() => handleJobAction(job.id, 'publish')}
                  >
                    Publish
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Briefcase" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No jobs found</h3>
          <p className="text-muted-foreground mb-4">
            {activeTab === 'all' ? 'Create your first job posting' : `No ${activeTab} jobs available`}
          </p>
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
