/**
 * Centralized route definitions for the integrated Fyndr.AI platform
 * This helps maintain consistency across the merged repositories
 */

// Routes from Repository A
export const ROUTES_A = {
  HOME: '/',
  HOMEPAGE: '/homepage',
  AUTH: '/authentication-login-register',
  ABOUT: '/about-contact-page',
  NOTIFICATIONS: '/notifications-center',
  PROFILE: '/profile-management',
  VIDEO_INTERVIEW: '/video-interview-interface',
};

// Routes from Repository B
export const ROUTES_B = {
  JOB_SEEKER_ONBOARDING: '/job-seeker-onboarding-wizard',
  JOB_DETAIL: '/job-detail-view',
  JOB_FEED: '/ai-powered-job-feed-dashboard',
  TEAM_MANAGEMENT: '/team-management-dashboard',
  RESUME_BUILDER: '/ai-resume-builder',
  RECRUITER_ONBOARDING: '/recruiter-employer-onboarding-wizard',
};

// Routes from Repository C
export const ROUTES_C = {
  COURSE_DETAIL: '/course-detail-learning-interface',
  CAREER_COACH: '/ai-career-coach-chat-interface',
  RECRUITER_DASHBOARD: '/recruiter-dashboard-pipeline-management',
  CANDIDATE_EVALUATION: '/candidate-profile-evaluation-interface',
  JOB_SEARCH: '/job-search-application-hub',
  ADMIN_DASHBOARD: '/admin-dashboard-system-management',
};

// Routes from Repository D
export const ROUTES_D = {
  INTERVIEW_PRACTICE: '/interview-practice-video-sessions',
  MENTORSHIP: '/mentorship-platform',
  RESOURCE_LIBRARY: '/resource-library',
  ALUMNI_NETWORK: '/alumni-network-referrals',
  CAREER_FAIR: '/virtual-career-fair',
  HACKATHONS: '/hackathons-competitions',
};

// Utility function to get route by name
export const getRoute = (routeName) => {
  const allRoutes = {
    ...ROUTES_A,
    ...ROUTES_B,
    ...ROUTES_C,
    ...ROUTES_D,
    NOT_FOUND: '*'
  };
  
  return allRoutes[routeName] || '/';
};

// Navigation structure
export const MAIN_NAV = [
  { 
    label: 'Home', 
    path: ROUTES_A.HOME,
    icon: 'Home'
  },
  { 
    label: 'Jobs', 
    path: ROUTES_B.JOB_FEED,
    icon: 'Briefcase'
  },
  { 
    label: 'Learn', 
    path: ROUTES_C.COURSE_DETAIL,
    icon: 'BookOpen'
  },
  { 
    label: 'Practice', 
    path: ROUTES_D.INTERVIEW_PRACTICE,
    icon: 'Video'
  },
  { 
    label: 'Network', 
    path: ROUTES_D.MENTORSHIP,
    icon: 'Users'
  }
];

// Resources submenu
export const RESOURCES_NAV = [
  {
    label: 'Career Coach AI',
    path: ROUTES_C.CAREER_COACH,
    description: 'Get personalized career advice from our AI',
    icon: 'MessageSquare'
  },
  {
    label: 'Resume Builder',
    path: ROUTES_B.RESUME_BUILDER, 
    description: 'Create an ATS-optimized resume with AI assistance',
    icon: 'FileText'
  },
  {
    label: 'Resource Library',
    path: ROUTES_D.RESOURCE_LIBRARY,
    description: 'Articles, guides and templates for your job search',
    icon: 'Library'
  },
  {
    label: 'Hackathons',
    path: ROUTES_D.HACKATHONS,
    description: 'Showcase your skills in tech competitions',
    icon: 'Code'
  },
  {
    label: 'Virtual Career Fair',
    path: ROUTES_D.CAREER_FAIR,
    description: 'Connect with employers in our virtual space',
    icon: 'Globe'
  }
];
