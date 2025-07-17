import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';

const ContentManagementSection = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [courses, setCourses] = useState([
    {
      id: 1,
      title: 'React Advanced Patterns',
      instructor: 'John Smith',
      status: 'published',
      enrollments: 1247,
      rating: 4.8,
      lastUpdated: '2024-07-05',
      category: 'Frontend Development'
    },
    {
      id: 2,
      title: 'Node.js Microservices',
      instructor: 'Sarah Wilson',
      status: 'draft',
      enrollments: 0,
      rating: 0,
      lastUpdated: '2024-07-08',
      category: 'Backend Development'
    },
    {
      id: 3,
      title: 'UI/UX Design Fundamentals',
      instructor: 'Mike Johnson',
      status: 'review',
      enrollments: 856,
      rating: 4.6,
      lastUpdated: '2024-07-07',
      category: 'Design'
    }
  ]);

  const [jobListings, setJobListings] = useState([
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      status: 'active',
      applications: 45,
      location: 'San Francisco, CA',
      salary: '$120,000 - $150,000',
      postedDate: '2024-07-01',
      expiryDate: '2024-08-01'
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      status: 'expired',
      applications: 23,
      location: 'Remote',
      salary: '$90,000 - $120,000',
      postedDate: '2024-06-15',
      expiryDate: '2024-07-15'
    },
    {
      id: 3,
      title: 'Product Manager',
      company: 'Innovation Labs',
      status: 'pending',
      applications: 0,
      location: 'New York, NY',
      salary: '$130,000 - $160,000',
      postedDate: '2024-07-09',
      expiryDate: '2024-08-09'
    }
  ]);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'Under Review' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'pending', label: 'Pending' }
  ];

  const tabs = [
    { id: 'courses', label: 'Courses', icon: 'BookOpen', count: courses.length },
    { id: 'jobs', label: 'Job Listings', icon: 'Briefcase', count: jobListings.length },
    { id: 'forum', label: 'Forum Posts', icon: 'MessageSquare', count: 156 },
    { id: 'reports', label: 'Reports', icon: 'Flag', count: 8 }
  ];

  const getStatusColor = (status) => {
    const colors = {
      published: 'text-success bg-success/10',
      active: 'text-success bg-success/10',
      draft: 'text-muted-foreground bg-muted/10',
      review: 'text-warning bg-warning/10',
      pending: 'text-warning bg-warning/10',
      expired: 'text-error bg-error/10'
    };
    return colors[status] || 'text-muted-foreground bg-muted/10';
  };

  const handleContentAction = (id, action, type) => {
    console.log(`${action} ${type}:`, id);
    
    if (type === 'course') {
      setCourses(prev => prev.map(course => 
        course.id === id ? { ...course, status: action } : course
      ));
    } else if (type === 'job') {
      setJobListings(prev => prev.map(job => 
        job.id === id ? { ...job, status: action } : job
      ));
    }
  };

  const renderCoursesTab = () => {
    const filteredCourses = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-4">
        {filteredCourses.map((course) => (
          <div key={course.id} className="glassmorphic-surface p-6 rounded-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-semibold text-foreground">{course.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                    {course.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  by {course.instructor} • {course.category}
                </p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Enrollments:</span>
                    <span className="ml-2 font-medium text-foreground">{course.enrollments.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rating:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {course.rating > 0 ? `${course.rating}/5` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="ml-2 font-medium text-foreground">{course.lastUpdated}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => console.log('Edit course:', course.id)}
                      iconName="Edit"
                    >
                      Edit
                    </Button>
                    {course.status === 'draft' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleContentAction(course.id, 'published', 'course')}
                        iconName="CheckCircle"
                      >
                        Publish
                      </Button>
                    )}
                    {course.status === 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleContentAction(course.id, 'draft', 'course')}
                        iconName="Eye"
                      >
                        Unpublish
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderJobsTab = () => {
    const filteredJobs = jobListings.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="glassmorphic-surface p-6 rounded-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-semibold text-foreground">{job.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {job.company} • {job.location}
                </p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Applications:</span>
                    <span className="ml-2 font-medium text-foreground">{job.applications}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Salary:</span>
                    <span className="ml-2 font-medium text-foreground">{job.salary}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Posted:</span>
                    <span className="ml-2 font-medium text-foreground">{job.postedDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => console.log('Edit job:', job.id)}
                      iconName="Edit"
                    >
                      Edit
                    </Button>
                    {job.status === 'pending' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleContentAction(job.id, 'active', 'job')}
                        iconName="CheckCircle"
                      >
                        Approve
                      </Button>
                    )}
                    {job.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleContentAction(job.id, 'expired', 'job')}
                        iconName="Eye"
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderForumTab = () => (
    <div className="text-center py-12">
      <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">Forum Management</h3>
      <p className="text-muted-foreground mb-4">Moderate forum posts and discussions</p>
      <Button iconName="Plus">Add Forum Category</Button>
    </div>
  );

  const renderReportsTab = () => (
    <div className="text-center py-12">
      <Icon name="Flag" size={48} className="text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">Content Reports</h3>
      <p className="text-muted-foreground mb-4">Review flagged content and user reports</p>
      <Button iconName="Eye">Review Reports</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Content Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage courses, job listings, and platform content
          </p>
        </div>
        <Button iconName="Plus" iconPosition="left">
          Add Content
        </Button>
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
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {(activeTab === 'courses' || activeTab === 'jobs') && (
        <div className="glassmorphic-surface p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="search"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Filter by status"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="glassmorphic-card p-6">
        {activeTab === 'courses' && renderCoursesTab()}
        {activeTab === 'jobs' && renderJobsTab()}
        {activeTab === 'forum' && renderForumTab()}
        {activeTab === 'reports' && renderReportsTab()}
      </div>
    </div>
  );
};

export default ContentManagementSection;
