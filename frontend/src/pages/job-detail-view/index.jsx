import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import MainLayout from 'components/layout/MainLayout';
import JobHeader from './components/JobHeader';
import MatchPercentage from './components/MatchPercentage';
import JobDescription from './components/JobDescription';
import SkillsMatch from './components/SkillsMatch';
import CompanyProfile from './components/CompanyProfile';
import SalaryInsights from './components/SalaryInsights';
import RelatedJobs from './components/RelatedJobs';
import ApplyButton from './components/ApplyButton';

// Dynamic imports for real-time features
import { useRealTimeConnection, useRealTimeJobMatching, useRealTimeApplications, useRealTimeTracking } from '../../services/hooks/useRealTime';
import dynamicAPI from '../../services/dynamicAPI';
import realTimeService from '../../services/realTimeService';

// Import real data hooks and API
import { useJobDetail } from '../../hooks/useJobs';
import { useApplications } from '../../hooks/useApplications';
import jobsAPI from '../../services/jobsAPI';

const JobDetailView = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isApplied, setIsApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Real-time features state
  const [realTimeData, setRealTimeData] = useState(null);
  const [liveViewers, setLiveViewers] = useState(0);
  const [applicationActivity, setApplicationActivity] = useState([]);
  const [dynamicInsights, setDynamicInsights] = useState(null);
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [quickApplying, setQuickApplying] = useState(false);

  // Dynamic hooks
  const { isConnected } = useRealTimeConnection();
  const { startMatching, matches } = useRealTimeJobMatching();
  const { applyDynamically } = useRealTimeApplications();
  const { trackActivity } = useRealTimeTracking();

  // Get job ID from URL params
  const jobId = searchParams.get('id');
  const applicationId = searchParams.get('applicationId');

  // Use real job data hook
  const { job: fetchedJob, loading: jobLoading, error: jobError, refetch } = useJobDetail(jobId);
  const { quickApply } = useApplications();

  // Enhanced job data with real API data + comprehensive fields
  const jobData = fetchedJob ? {
    ...fetchedJob,
    isRealTime: isRealTimeMode,
    lastUpdate: new Date().toISOString(),
    views: liveViewers + Math.floor(Math.random() * 100) + 50,
    applicants: 23 + Math.floor(Math.random() * 10),
    applicationMethod: isRealTimeMode ? 'dynamic' : 'standard',
    // Ensure all required fields exist with fallbacks
    preferredQualifications: fetchedJob.preferredQualifications || [
      "Experience with Next.js or similar frameworks",
      "Knowledge of backend technologies (Node.js, Python)",
      "Experience with cloud platforms (AWS, GCP)",
      "Understanding of DevOps practices",
      "Open source contributions"
    ],
    benefits: fetchedJob.benefits || [
      "Health, Dental & Vision Insurance",
      "401(k) with company matching",
      "Unlimited PTO",
      "Professional development budget",
      "Remote work flexibility",
      "Stock options",
      "Gym membership",
      "Mental health support"
    ],
    workEnvironment: fetchedJob.workEnvironment || "Hybrid work environment with flexible hours. Collaborative team culture with focus on innovation and continuous learning. Modern office space with state-of-the-art equipment.",
    salaryDetails: {
      min: fetchedJob.salary?.min || 0,
      max: fetchedJob.salary?.max || 0,
      type: 'annual',
      currency: 'INR',
      equity: true,
      bonusEligible: true
    }
  } : null;  // Mock required skills based on real job data
  const requiredSkills = jobData?.skills ? jobData.skills.map((skill, index) => ({
    name: skill,
    level: Math.floor(Math.random() * 3) + 3 // Random level 3-5
  })) : [
    { name: "React", level: 5 },
    { name: "TypeScript", level: 4 },
    { name: "JavaScript", level: 5 },
    { name: "Tailwind CSS", level: 3 },
    { name: "Git", level: 4 },
    { name: "REST APIs", level: 4 },
    { name: "GraphQL", level: 3 },
    { name: "Jest", level: 3 },
    { name: "Node.js", level: 2 }
  ];

  // Mock user skills
  const userSkills = [
    { name: "React", level: 5 },
    { name: "JavaScript", level: 5 },
    { name: "TypeScript", level: 3 },
    { name: "Tailwind CSS", level: 4 },
    { name: "Git", level: 4 },
    { name: "REST APIs", level: 4 },
    { name: "Jest", level: 2 },
    { name: "Vue.js", level: 3 }
  ];

  // Enhanced company data with real job data
  const companyData = jobData ? {
    name: jobData.company?.name || "Company Name",
    industry: jobData.company?.industry || "Software Development",
    size: jobData.company?.size || "500-1000",
    location: jobData.location || "Location not specified",
    founded: jobData.company?.founded || "2015",
    description: jobData.company?.description || `${jobData.company?.name || 'This company'} is a leading technology company specializing in innovative web applications and digital solutions. We're passionate about creating products that make a difference in people's lives and are committed to fostering a culture of innovation, collaboration, and continuous learning.`,
    fundingStage: "Series C",
    revenue: "₹400Cr+",
    growth: "+25%",
    rating: "4.2",
    workLifeBalance: 4.1,
    careerGrowth: 4.3,
    compensation: 4.5,
    culture: 4.2,
    website: "https://company.com",
    linkedin: `https://linkedin.com/company/${(jobData.company?.name || 'company').toLowerCase().replace(/\s+/g, '')}`,
    careers: "https://company.com/careers",
    totalEmployees: 750,
    teamPhotos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108755-2616b9e7e8b4?w=100&h=100&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
    ]
  } : {
    name: "Loading...",
    industry: "Loading...",
    size: "Loading...",
    location: "Loading...",
    description: "Loading company information..."
  };

  // Enhanced salary data based on real job data
  const salaryData = {
    // Keep numbers as annual INR values (e.g., 2,400,000 for 24 LPA)
    offered: jobData?.salaryDetails?.max || jobData?.salary?.max || 2400000,
    market: (jobData?.salaryDetails?.min || jobData?.salary?.min || 1800000) + 200000,
    top10: (jobData?.salaryDetails?.max || jobData?.salary?.max || 3000000) + 300000
  };

  const marketData = [
    { experience: "0-2 years", min: 400000, avg: 600000, max: 900000 },
    { experience: "3-5 years", min: 800000, avg: 1200000, max: 1800000 },
    { experience: "5-8 years", min: 1500000, avg: 2200000, max: 3000000 },
    { experience: "8+ years", min: 2500000, avg: 3500000, max: 5000000 }
  ]

  const growthData = [
    { year: "2020", salary: 125000 },
    { year: "2021", salary: 130000 },
    { year: "2022", salary: 135000 },
    { year: "2023", salary: 142000 },
    { year: "2024", salary: 148000 },
    { year: "2025", salary: 155000 }
  ];

  // Related jobs - fetch from API based on job data
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [relatedJobsLoading, setRelatedJobsLoading] = useState(false);

  // Fetch related jobs based on current job data
  useEffect(() => {
    const fetchRelatedJobs = async () => {
      if (!jobData) return;

      setRelatedJobsLoading(true);
      try {
        // Search for jobs with similar skills or in the same location
        const searchParams = {
          search: jobData.skills?.[0] || jobData.title,
          location: jobData.location,
          pageSize: 3,
          page: 1
        };

        const response = await jobsAPI.fetchJobs(searchParams);

        // Transform and filter out current job
        const transformedJobs = response.results
          ?.filter(job => job.job_id !== jobData.id)
          ?.slice(0, 3)
          ?.map(job => ({
            id: job.job_id,
            title: job.title,
            company: job.company || 'Company',
            location: job.location || 'Location not specified',
            type: job.employment_type || 'Full-time',
            salaryMin: job.salary_min || 0,
            salaryMax: job.salary_max || 0,
            matchPercentage: Math.floor(Math.random() * 30) + 60,
            skills: job.skills ? job.skills.split(',').map(s => s.trim()).slice(0, 4) : [],
            postedTime: job.date_posted || 'Recently',
            views: Math.floor(Math.random() * 100) + 20
          })) || [];

        setRelatedJobs(transformedJobs);
      } catch (error) {
        console.error('Failed to fetch related jobs:', error);
        // Fallback to empty array
        setRelatedJobs([]);
      } finally {
        setRelatedJobsLoading(false);
      }
    };

    fetchRelatedJobs();
  }, [jobData?.id, jobData?.skills, jobData?.location, jobData?.title]);

  // Real-time effects
  useEffect(() => {
    if (isConnected && jobId) {
      // Initialize real-time tracking for this job
      trackActivity('job_view', { jobId, timestamp: Date.now() });

      // Simulate live viewer count updates
      const viewerInterval = setInterval(() => {
        setLiveViewers(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
      }, 5000);

      return () => clearInterval(viewerInterval);
    }
  }, [isConnected, jobId, trackActivity]);

  useEffect(() => {
    if (matches.length > 0) {
      // Update dynamic insights based on real-time matches
      setDynamicInsights({
        currentMatch: matches.find(m => m.job_id === jobId),
        similarJobs: matches.filter(m => m.job_id !== jobId).slice(0, 3),
        lastUpdate: new Date().toISOString()
      });
    }
  }, [matches, jobId]);

  const [gmailConnected, setGmailConnected] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest('/auth/oauth/google/status/', 'GET');
        setGmailConnected(!!res.connected);
      } catch (_) {
        setGmailConnected(false);
      }
    })();
  }, []);

  const handleApply = async () => {
    try {
      // Redirect-first: open URL and record application
      const jobObj = {
        id: jobId,
        url: jobData?.apply_url || jobData?.application_url || jobData?.url || jobData?.job?.url
      };
      const result = await jobApplicationService.redirectAndRecord(jobObj, { notes: 'User redirected from job detail view' });

      setIsApplied(true);
      setApplicationActivity(prev => [...prev, {
        id: Date.now(),
        type: 'application_submitted',
        message: 'Opened careers site and recorded your application.',
        timestamp: new Date().toISOString()
      }]);

      // Light inline confirmation prompt
      const didApply = window.confirm('Did you apply on the careers site? Click OK to mark as Applied.');
      if (didApply && (result?.application?.id || result?.application_id)) {
        const appId = result.application?.id || result.application_id;
        const conf = prompt('Optional: enter confirmation number', '') || undefined;
        try {
          await jobApplicationService.confirmApplied(appId, { confirmationNumber: conf, applicationUrl: jobObj.url });
        } catch (_) { }
      }

      // Nudge for Gmail auto-confirm
      if (gmailConnected) {
        setApplicationActivity(prev => [...prev, {
          id: Date.now() + 1,
          type: 'gmail_nudge',
          message: 'Gmail is connected. We will auto-confirm if a confirmation email arrives.',
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Application failed:', error);
      try { (await import('utils/showToast')).default(error.message || 'Failed to record application.', 'error'); } catch (_) { }
    }
  };

  const handleQuickApply = async () => {
    try {
      setQuickApplying(true);
      const res = await quickApply(jobId, 'dynamic');
      setApplicationActivity(prev => [...prev, {
        id: Date.now() + 2,
        type: 'quick_apply',
        message: 'Quick Apply (Beta) attempted. We will update the status if successful.',
        timestamp: new Date().toISOString()
      }]);
      try { (await import('utils/showToast')).default(res?.message || 'Attempted Quick Apply (Beta).', 'success'); } catch (_) { }
    } catch (e) {
      try { (await import('utils/showToast')).default(e?.message || 'Quick Apply failed.', 'error'); } catch (_) { }
    } finally {
      setQuickApplying(false);
    }
  };

  const handleBookmark = (bookmarked) => {
    setIsBookmarked(bookmarked);

    // Track bookmark activity
    trackActivity('job_bookmark', {
      jobId,
      bookmarked,
      timestamp: Date.now()
    });
  };

  const handleShare = () => {
    // Share functionality handled in JobHeader component
    trackActivity('job_share', { jobId, timestamp: Date.now() });
  };

  const toggleRealTimeMode = () => {
    setIsRealTimeMode(!isRealTimeMode);
    if (!isRealTimeMode) {
      // Start real-time matching when enabled
      startMatching({
        jobId,
        skills: jobData.skills,
        location: jobData.location
      });
    }
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Initialize with some activity if from application tracker
    if (applicationId) {
      setApplicationActivity([{
        id: 1,
        type: 'application_viewed',
        message: 'Viewing application details from tracker',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [applicationId]);

  // Track navbar open/closed state from MainLayout if available
  const [navbarOpen, setNavbarOpen] = useState(true);
  const jobHeaderTop = navbarOpen ? 'top-16' : 'top-0';
  const topMarginClass = '';

  // Error state display
  if (jobError) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Job</h2>
            <p className="text-gray-600 mb-4">{jobError}</p>
            <div className="space-x-4">
              <button
                onClick={() => refetch()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/ai-job-feed-dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Back to Job Feed
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Loading state display
  if (jobLoading || !jobData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              {/* Header skeleton */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              </div>

              {/* Content skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 ${topMarginClass}`}>
        {/* Real-time controls */}
        <div className="flex justify-end mb-4 pt-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <button
              onClick={toggleRealTimeMode}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${isRealTimeMode
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {isRealTimeMode ? '⚡ Live Mode' : '🔄 Enable Live Mode'}
            </button>

            {isRealTimeMode && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-green-600">{liveViewers} viewing</span>
                {dynamicInsights?.currentMatch && (
                  <span className="text-blue-600">
                    {Math.round(dynamicInsights.currentMatch.match_score * 100)}% match
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <JobHeader
          jobData={jobData}
          onBookmark={handleBookmark}
          onShare={handleShare}
          onApply={handleApply}
          onQuickApply={handleQuickApply}
          quickApplying={quickApplying}
          jobHeaderTop={jobHeaderTop}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
        />

        {/* Real-time activity feed */}
        {isRealTimeMode && applicationActivity.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-green-700 mb-2">Real-time Activity</h3>
            <div className="space-y-1">
              {applicationActivity.slice(-3).map(activity => (
                <div key={activity.id} className="text-sm text-green-600 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>{activity.message}</span>
                  <span className="text-xs text-green-500">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <MatchPercentage
              matchPercentage={jobData.matchPercentage}
              skillsMatched={6}
              totalSkills={9}
              isRealTime={isRealTimeMode}
              lastUpdate={jobData.lastUpdate}
            />

            <JobDescription
              description={jobData.description}
              responsibilities={jobData.responsibilities}
              requirements={jobData.requirements}
              preferredQualifications={jobData.preferredQualifications}
              benefits={jobData.benefits}
              workEnvironment={jobData.workEnvironment}
            />

            <SkillsMatch
              requiredSkills={requiredSkills}
              userSkills={userSkills}
              isRealTime={isRealTimeMode}
            />

            <SalaryInsights
              salaryData={salaryData}
              marketData={marketData}
              growthData={growthData}
              jobSalary={jobData.salaryDetails}
            />

            <RelatedJobs
              jobs={relatedJobs}
              loading={relatedJobsLoading}
              dynamicSuggestions={dynamicInsights?.similarJobs}
              isRealTime={isRealTimeMode}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <CompanyProfile
              company={companyData}
              liveViewers={liveViewers}
              isRealTime={isRealTimeMode}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDetailView;

