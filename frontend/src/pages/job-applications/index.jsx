import React, { useState, useEffect, useCallback } from "react";
import { apiRequest } from "utils/api";
import { Helmet } from "react-helmet";
import MainLayout from "components/layout/MainLayout";
import ApplicationCard from "./ApplicationCard";
import ApplicationFilters from "./ApplicationFilters";
import ApplicationStats from "./ApplicationStats";
import EmptyState from "./EmptyState";

// Dynamic imports for real-time features
import { useRealTimeConnection, useApplicationTracking } from "../../services/hooks/useRealTime";
import { useApplications } from "../../hooks/useApplications";

const JobApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gmailStatus, setGmailStatus] = useState({ loading: true, connected: false });
  const [filters, setFilters] = useState({
    status: 'all',
    company: 'all',
    dateRange: 'all',
    searchQuery: ''
  });

  // Real-time features state
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [applicationUpdates, setApplicationUpdates] = useState({});

  // Real-time connection status
  const { isConnected } = useRealTimeConnection();
  const { stopTracking } = useApplicationTracking();
  // Applications data/services
  const {
    applications: liveApplications,
    stats,
    fetchApplications,
    updateApplicationStatus
  } = useApplications();

  // Enhanced mock data with comprehensive job information
  const mockApplications = [
    {
      id: '1',
      applicationId: 'app_001',
      jobTitle: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      companyLogo: '/api/placeholder/48/48',
      status: 'applied',
      appliedDate: '2024-01-15T10:30:00Z',
      lastUpdate: '2024-01-15T10:30:00Z',
      applicationMethod: 'platform',
      jobLocation: 'San Francisco, CA',
      jobType: 'Full-time',
      salary: { min: 120000, max: 150000 },
      description: 'We are looking for an experienced Senior Software Engineer to join our dynamic team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies including React, Node.js, and cloud platforms.',
      requirements: [
        '5+ years of experience in software development',
        'Strong proficiency in JavaScript, React, and Node.js',
        'Experience with cloud platforms (AWS, Azure, GCP)',
        'Knowledge of microservices architecture',
        'Experience with CI/CD pipelines',
        'Strong problem-solving and communication skills'
      ],
      skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'MongoDB'],
      preferredQualifications: [
        'Experience with GraphQL and REST APIs',
        'Knowledge of DevOps practices',
        'Experience with agile development methodologies',
        'Bachelor\'s degree in Computer Science or related field'
      ],
      benefits: [
        'Health, dental, and vision insurance',
        'Flexible work from home policy',
        '401(k) with company matching',
        'Professional development budget',
        'Unlimited PTO policy'
      ],
      workEnvironment: 'Hybrid (3 days office, 2 days remote)',
      nextStep: null,
      jobUrl: 'https://techcorp.com/careers/senior-software-engineer',
      postedDate: '2024-01-10T08:00:00Z',
      applicationDeadline: '2024-02-15T23:59:59Z'
    },
    {
      id: '2',
      applicationId: 'app_002',
      jobTitle: 'Frontend Developer',
      company: 'StartupXYZ',
      companyLogo: '/api/placeholder/48/48',
      status: 'reviewing',
      appliedDate: '2024-01-12T14:20:00Z',
      lastUpdate: '2024-01-14T09:15:00Z',
      applicationMethod: 'external',
      jobLocation: 'Remote',
      jobType: 'Full-time',
      salary: { min: 90000, max: 110000 },
      description: 'Join our fast-growing startup as a Frontend Developer! You\'ll work on cutting-edge user interfaces using the latest web technologies. We\'re building the next generation of fintech applications and need someone passionate about creating exceptional user experiences.',
      requirements: [
        '3+ years of frontend development experience',
        'Expert-level knowledge of React and modern JavaScript',
        'Experience with state management (Redux, Zustand)',
        'Proficiency in CSS-in-JS libraries (styled-components, emotion)',
        'Experience with testing frameworks (Jest, React Testing Library)',
        'Strong eye for design and user experience'
      ],
      skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML5', 'Redux', 'Webpack', 'Sass'],
      preferredQualifications: [
        'Experience with Next.js or similar React frameworks',
        'Knowledge of design systems and component libraries',
        'Experience with mobile-responsive design',
        'Familiarity with backend technologies'
      ],
      benefits: [
        'Competitive salary with equity options',
        'Fully remote work environment',
        'Health and wellness stipend',
        'Learning and development budget',
        'Flexible working hours'
      ],
      workEnvironment: 'Fully Remote',
      nextStep: 'Initial phone screening scheduled for Jan 18th',
      jobUrl: 'https://startupxyz.com/jobs/frontend-developer',
      postedDate: '2024-01-08T10:00:00Z',
      applicationDeadline: '2024-02-08T23:59:59Z'
    },
    {
      id: '3',
      applicationId: 'app_003',
      jobTitle: 'Full Stack Developer',
      company: 'InnovateLabs',
      companyLogo: '/api/placeholder/48/48',
      status: 'interview',
      appliedDate: '2024-01-08T16:45:00Z',
      lastUpdate: '2024-01-16T11:30:00Z',
      applicationMethod: 'platform',
      jobLocation: 'New York, NY',
      jobType: 'Full-time',
      salary: { min: 100000, max: 130000 },
      description: 'We\'re seeking a talented Full Stack Developer to join our innovation team. You\'ll work on both frontend and backend development for our enterprise software solutions, collaborating with cross-functional teams to deliver high-quality products.',
      requirements: [
        '4+ years of full-stack development experience',
        'Proficiency in Python and Django or Flask',
        'Strong frontend skills with React or Vue.js',
        'Experience with PostgreSQL or similar databases',
        'Knowledge of RESTful API design and development',
        'Experience with version control (Git) and agile methodologies'
      ],
      skills: ['Python', 'Django', 'React', 'PostgreSQL', 'Docker', 'Redis', 'Celery', 'REST APIs'],
      preferredQualifications: [
        'Experience with cloud deployment (AWS, Heroku)',
        'Knowledge of machine learning libraries',
        'Experience with microservices architecture',
        'Familiarity with DevOps tools and practices'
      ],
      benefits: [
        'Comprehensive health benefits',
        'Flexible work arrangements',
        'Professional conference attendance',
        'Stock options',
        'Gym membership reimbursement'
      ],
      workEnvironment: 'Hybrid (Flexible)',
      nextStep: 'Technical interview on Jan 20th at 2:00 PM',
      jobUrl: 'https://innovatelabs.com/careers/fullstack-developer',
      postedDate: '2024-01-05T12:00:00Z',
      applicationDeadline: '2024-02-05T23:59:59Z'
    },
    {
      id: '4',
      applicationId: 'app_004',
      jobTitle: 'React Developer',
      company: 'DesignStudio',
      companyLogo: '/api/placeholder/48/48',
      status: 'rejected',
      appliedDate: '2024-01-05T09:00:00Z',
      lastUpdate: '2024-01-10T17:20:00Z',
      applicationMethod: 'external',
      jobLocation: 'Los Angeles, CA',
      jobType: 'Contract',
      salary: { min: 80, max: 120, type: 'hourly' },
      description: 'Contract opportunity for an experienced React Developer to work on exciting client projects. You\'ll be building responsive web applications and working closely with our design team to create pixel-perfect implementations.',
      requirements: [
        '3+ years of React development experience',
        'Strong CSS and responsive design skills',
        'Experience with modern build tools (Webpack, Vite)',
        'Proficiency in Git and collaborative development',
        'Ability to work independently and meet deadlines'
      ],
      skills: ['React', 'CSS3', 'HTML5', 'JavaScript', 'Styled Components', 'Figma', 'Git'],
      preferredQualifications: [
        'Experience with animation libraries (Framer Motion, GSAP)',
        'Knowledge of performance optimization techniques',
        'Experience working with design systems',
        'Portfolio of responsive web applications'
      ],
      benefits: [
        'Competitive hourly rate',
        'Flexible contract terms',
        'Opportunity for long-term collaboration',
        'Remote work options'
      ],
      workEnvironment: 'Contract/Remote Available',
      nextStep: null,
      rejectionReason: 'Position filled with candidate with more design system experience',
      jobUrl: 'https://designstudio.com/contracts/react-developer',
      postedDate: '2024-01-02T14:00:00Z',
      applicationDeadline: '2024-01-31T23:59:59Z'
    }
  ];

  useEffect(() => {
    // Load applications from backend and keep in sync via WebSocket events
    const load = async () => {
      try {
        setLoading(true);
        await fetchApplications(1, 50);
        setError(null);
      } catch (e) {
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchApplications]);

  // Load Gmail connection status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await apiRequest('/auth/oauth/google/status/', 'GET');
        setGmailStatus({ loading: false, connected: !!res.connected });
      } catch (e) {
        setGmailStatus({ loading: false, connected: false });
      }
    };
    fetchStatus();
  }, []);

  const connectGmail = async () => {
    try {
      const res = await apiRequest('/auth/oauth/google/init/', 'GET');
      if (res && res.authorize_url) {
        try { localStorage.setItem('postGoogleConnectNext', '/job-applications'); } catch {}
        window.location.href = res.authorize_url;
      }
    } catch (e) {
      console.error('Failed to start Google OAuth:', e);
    }
  };

  const GmailNudge = () => {
    if (gmailStatus.loading) return null;
    return (
      <div className="mb-4">
        {gmailStatus.connected ? (
          <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 inline-block">
            Gmail Connected — we’ll auto-confirm applications from your inbox.
          </div>
        ) : (
          <button
            onClick={connectGmail}
            className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2"
          >
            Connect Gmail to auto-confirm application emails
          </button>
        )}
      </div>
    );
  };

  // Sync local list with liveApplications
  useEffect(() => {
    if (Array.isArray(liveApplications)) {
      const mapped = liveApplications.map(a => ({
        id: a.id,
        jobTitle: a.job?.title || a.job_title || 'Untitled',
        company: a.job?.company || a.company || '',
        location: a.job?.location || a.location || '',
        status: a.status || 'applied',
        appliedDate: a.created_at || a.applied_at || a.appliedDate,
        lastUpdate: a.updated_at || a.lastUpdate,
        applicationMethod: a.application_method || a.applicationMethod,
  jobUrl: a.application_url || a.job?.url || a.job_url,
        companyLogo: a.job?.company_logo || a.company_logo,
        notes: a.notes,
  confirmationNumber: a.confirmation_number || a.external_application_id || null,
  is_verified: a.is_verified || false,
  verified_source: a.verified_source || null,
  automation_log: a.automation_log || [],
      }));
      setApplications(mapped);
      setFilteredApplications(prev => prev.length ? prev : mapped);
    }
  }, [liveApplications]);

  useEffect(() => {
    let filtered = applications;

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    // Filter by company
    if (filters.company !== 'all') {
      filtered = filtered.filter(app => app.company === filters.company);
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.jobTitle.toLowerCase().includes(query) ||
        app.company.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query)
      );
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }

      if (filters.dateRange !== 'all') {
        filtered = filtered.filter(app => new Date(app.appliedDate) >= filterDate);
      }
    }

    setFilteredApplications(filtered);
  }, [applications, filters]);

  // Real-time indicators based on socket connection
  useEffect(() => {
    if (isConnected) {
      setApplicationUpdates(upd => upd); // placeholder to show LIVE badge
    }
  }, [isConnected]);

  // Real-time mode toggle
  const handleRealTimeModeToggle = useCallback(async () => {
    if (realTimeMode) {
      // Disable real-time mode
      applications.forEach(app => {
        try { stopTracking(app.id); } catch { /* noop */ }
      });
      setRealTimeMode(false);
      console.log('🛑 Real-time tracking disabled');
    } else {
      // Enable real-time mode
      setRealTimeMode(true);
      console.log('🚀 Real-time tracking enabled');
    }
  }, [realTimeMode, applications, stopTracking]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleWithdrawApplication = async (applicationId) => {
    try {
    await updateApplicationStatus(applicationId, 'withdrawn');
    await fetchApplications(1, 50);
    } catch (err) {
      console.error('Failed to withdraw application:', err);
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    try {
    // If delete API exists, call it; otherwise just filter locally
    setApplications(prev => prev.filter(app => app.id !== applicationId));
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Helmet>
          <title>My Applications - Fyndr.AI</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="glass-card p-8 rounded-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4 text-center">Loading your applications...</p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Helmet>
          <title>My Applications - Fyndr.AI</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="glass-card p-8 rounded-xl text-center">
                <div className="text-destructive text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Applications</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Helmet>
        <title>My Applications - Fyndr.AI</title>
        <meta name="description" content="Track and manage your job applications with Fyndr.AI's comprehensive application dashboard." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="glass-card p-6 rounded-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    My Applications
                  </h1>
                  <p className="text-muted-foreground">
                    Track and manage all your job applications in one place
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded border ${gmailStatus.connected ? 'border-green-500 text-green-600' : 'border-gray-400 text-gray-600'}`}>
                      {gmailStatus.loading ? 'Checking Gmail…' : gmailStatus.connected ? 'Gmail Connected' : 'Gmail Not Connected'}
                    </span>
                    {!gmailStatus.connected && !gmailStatus.loading && (
                      <button className="text-xs underline text-primary" onClick={connectGmail}>
                        Connect Gmail
                      </button>
                    )}
                  </div>
                </div>

                {/* Real-time controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm font-medium">
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>

                    <button
                      onClick={handleRealTimeModeToggle}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${realTimeMode
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      {realTimeMode ? '⚡ Live Tracking' : '🔄 Enable Live Tracking'}
                    </button>

                    {realTimeMode && Object.keys(applicationUpdates).length > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        {Object.keys(applicationUpdates).length} live updates
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="btn-secondary">
                      <span className="mr-2">📊</span>
                      Export Data
                    </button>
                    <button className="btn-primary">
                      <span className="mr-2">🔍</span>
                      Find Jobs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <ApplicationStats applications={applications} />

          {/* Filters Section */}
          <ApplicationFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            applications={applications}
          />

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.length === 0 ? (
              <EmptyState
                hasApplications={applications.length > 0}
                filters={filters}
                onClearFilters={() => setFilters({
                  status: 'all',
                  company: 'all',
                  dateRange: 'all',
                  searchQuery: ''
                })}
              />
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    {filteredApplications.length} Application{filteredApplications.length !== 1 ? 's' : ''}
                  </h2>
                  <select className="bg-white/80 backdrop-blur-sm border border-border rounded-lg px-3 py-1 text-sm">
                    <option>Sort by Date Applied</option>
                    <option>Sort by Company</option>
                    <option>Sort by Status</option>
                    <option>Sort by Last Update</option>
                  </select>
                </div>

                {filteredApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onStatusUpdate={updateApplicationStatus}
                    onRemove={handleDeleteApplication}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobApplications;
