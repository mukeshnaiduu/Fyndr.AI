/**
 * Role-based navigation configurations for Fyndr.AI platform
 * Implements RBAC (Role-Based Access Control) for different user types
 */

import { ROUTES_A, ROUTES_B, ROUTES_C, ROUTES_D } from './routes';

// Navigation configuration for Job Seekers
export const JOB_SEEKER_NAV = {
  main: [
    {
      label: 'Home',
      path: ROUTES_A.HOME,
      icon: 'Home',
      description: 'Your dashboard and overview'
    },
    {
      label: 'Jobs',
      path: ROUTES_B.JOB_FEED,
      icon: 'Briefcase',
      description: 'Browse and apply to jobs'
    },
    {
      label: 'Applications',
      path: ROUTES_C.JOB_SEARCH,
      icon: 'ClipboardList',
      description: 'Track your applications'
    },
    {
      label: 'Learn',
      path: ROUTES_C.COURSE_DETAIL,
      icon: 'BookOpen',
      description: 'Skill development courses'
    },
    {
      label: 'Practice',
      path: ROUTES_D.INTERVIEW_PRACTICE,
      icon: 'Video',
      description: 'Interview practice sessions'
    }
  ],
  resources: [
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
      label: 'Mentorship',
      path: ROUTES_D.MENTORSHIP,
      description: 'Connect with industry mentors',
      icon: 'Users'
    },
    {
      label: 'Alumni Network',
      path: ROUTES_D.ALUMNI_NETWORK,
      description: 'Connect with alumni for referrals',
      icon: 'Network'
    },
    {
      label: 'Virtual Career Fair',
      path: ROUTES_D.CAREER_FAIR,
      description: 'Connect with employers in our virtual space',
      icon: 'Globe'
    },
    {
      label: 'Hackathons',
      path: ROUTES_D.HACKATHONS,
      description: 'Showcase your skills in tech competitions',
      icon: 'Code'
    }
  ],
  profile: [
    {
      label: 'Profile',
      path: '/profile-management',
      icon: 'User',
      description: 'Manage your profile information'
    },
    {
      label: 'Applications',
      path: ROUTES_C.JOB_SEARCH,
      icon: 'ClipboardCheck',
      description: 'View your job applications'
    },
    {
      label: 'Notifications',
      path: ROUTES_A.NOTIFICATIONS,
      icon: 'Bell',
      description: 'View your notifications'
    },
    {
      label: 'Settings',
      path: '#',
      icon: 'Settings',
      description: 'Account settings'
    }
  ]
};

// Navigation configuration for Recruiters
export const RECRUITER_NAV = {
  main: [
    {
      label: 'Dashboard',
      path: ROUTES_C.RECRUITER_DASHBOARD,
      icon: 'BarChart3',
      description: 'Recruitment pipeline overview'
    },
    {
      label: 'Candidates',
      path: ROUTES_C.CANDIDATE_EVALUATION,
      icon: 'Users',
      description: 'Browse and evaluate candidates'
    },
    {
      label: 'Jobs',
      path: ROUTES_B.JOB_FEED,
      icon: 'Briefcase',
      description: 'Manage job postings'
    },
    {
      label: 'Team',
      path: ROUTES_B.TEAM_MANAGEMENT,
      icon: 'UserCheck',
      description: 'Manage your recruitment team'
    },
    {
      label: 'Interviews',
      path: ROUTES_D.INTERVIEW_PRACTICE,
      icon: 'Video',
      description: 'Schedule and conduct interviews'
    }
  ],
  resources: [
    {
      label: 'Candidate Sourcing',
      path: ROUTES_C.CANDIDATE_EVALUATION,
      description: 'Advanced candidate search and filtering',
      icon: 'Search'
    },
    {
      label: 'Analytics',
      path: ROUTES_C.RECRUITER_DASHBOARD,
      description: 'Recruitment metrics and insights',
      icon: 'TrendingUp'
    },
    {
      label: 'Virtual Career Fair',
      path: ROUTES_D.CAREER_FAIR,
      description: 'Host virtual recruitment events',
      icon: 'Globe'
    },
    {
      label: 'Resource Library',
      path: ROUTES_D.RESOURCE_LIBRARY,
      description: 'Best practices and recruitment guides',
      icon: 'Library'
    }
  ],
  profile: [
    {
      label: 'Profile',
      path: '/profile-management',
      icon: 'User',
      description: 'Manage your personal profile'
    },
    {
      label: 'Team Management',
      path: ROUTES_B.TEAM_MANAGEMENT,
      icon: 'Users',
      description: 'Manage your team'
    },
    {
      label: 'Notifications',
      path: ROUTES_A.NOTIFICATIONS,
      icon: 'Bell',
      description: 'View your notifications'
    },
    {
      label: 'Settings',
      path: '#',
      icon: 'Settings',
      description: 'Account settings'
    }
  ]
};

// Navigation configuration for Employers
export const EMPLOYER_NAV = {
  main: [
    {
      label: 'Dashboard',
      path: ROUTES_C.RECRUITER_DASHBOARD,
      icon: 'BarChart3',
      description: 'Company hiring overview'
    },
    {
      label: 'Job Postings',
      path: ROUTES_B.JOB_FEED,
      icon: 'Briefcase',
      description: 'Create and manage job posts'
    },
    {
      label: 'Candidates',
      path: ROUTES_C.CANDIDATE_EVALUATION,
      icon: 'Users',
      description: 'Review applicants'
    },
    {
      label: 'Team',
      path: ROUTES_B.TEAM_MANAGEMENT,
      icon: 'UserCheck',
      description: 'Manage hiring team'
    },
    {
      label: 'Analytics',
      path: ROUTES_C.RECRUITER_DASHBOARD,
      icon: 'TrendingUp',
      description: 'Hiring analytics'
    }
  ],
  resources: [
    {
      label: 'Employer Branding',
      path: ROUTES_D.RESOURCE_LIBRARY,
      description: 'Build your company brand',
      icon: 'Award'
    },
    {
      label: 'Virtual Career Fair',
      path: ROUTES_D.CAREER_FAIR,
      description: 'Host virtual recruitment events',
      icon: 'Globe'
    },
    {
      label: 'Best Practices',
      path: ROUTES_D.RESOURCE_LIBRARY,
      description: 'Hiring and recruitment guides',
      icon: 'Library'
    }
  ],
  profile: [
    {
      label: 'Company Profile',
      path: '/employer-profile-management',
      icon: 'Building',
      description: 'Manage company information'
    },
    {
      label: 'Billing',
      path: '#',
      icon: 'CreditCard',
      description: 'Manage subscription and billing'
    },
    {
      label: 'Notifications',
      path: ROUTES_A.NOTIFICATIONS,
      icon: 'Bell',
      description: 'View your notifications'
    },
    {
      label: 'Settings',
      path: '#',
      icon: 'Settings',
      description: 'Account settings'
    }
  ]
};

// Navigation configuration for Administrators
export const ADMINISTRATOR_NAV = {
  main: [
    {
      label: 'System Dashboard',
      path: ROUTES_C.ADMIN_DASHBOARD,
      icon: 'Monitor',
      description: 'System overview and management'
    },
    {
      label: 'User Management',
      path: ROUTES_C.ADMIN_DASHBOARD,
      icon: 'Users',
      description: 'Manage all users'
    },
    {
      label: 'Content Management',
      path: ROUTES_D.RESOURCE_LIBRARY,
      icon: 'FileText',
      description: 'Manage platform content'
    },
    {
      label: 'Analytics',
      path: ROUTES_C.ADMIN_DASHBOARD,
      icon: 'BarChart3',
      description: 'Platform analytics'
    }
  ],
  resources: [
    {
      label: 'System Logs',
      path: ROUTES_C.ADMIN_DASHBOARD,
      description: 'View system logs and monitoring',
      icon: 'FileSearch'
    },
    {
      label: 'Reports',
      path: ROUTES_C.ADMIN_DASHBOARD,
      description: 'Generate system reports',
      icon: 'BarChart'
    }
  ],
  profile: [
    {
      label: 'Admin Profile',
      path: '/admin-profile-management',
      icon: 'Shield',
      description: 'Manage admin settings'
    },
    {
      label: 'System Settings',
      path: ROUTES_C.ADMIN_DASHBOARD,
      icon: 'Settings',
      description: 'Configure system settings'
    },
    {
      label: 'Notifications',
      path: ROUTES_A.NOTIFICATIONS,
      icon: 'Bell',
      description: 'View system notifications'
    }
  ]
};

// Navigation configuration for Company role (replaces employer)
export const COMPANY_NAV = {
  main: [
    {
      label: 'Dashboard',
      path: '/company-dashboard-pipeline-management',
      icon: 'Home',
      description: 'Your recruitment overview'
    },
    {
      label: 'Candidates',
      path: '/candidate-profile-evaluation-interface',
      icon: 'Users',
      description: 'Browse and manage candidates'
    },
    {
      label: 'Jobs',
      path: '/job-creation-hub',
      icon: 'Briefcase',
      description: 'Post and manage job listings'
    },
    {
      label: 'Team',
      path: '/team-management-dashboard',
      icon: 'UserPlus',
      description: 'Manage your recruitment team'
    },
    {
      label: 'Analytics',
      path: '/recruiter-analytics-dashboard',
      icon: 'BarChart2',
      description: 'Recruitment metrics and insights'
    }
  ],
  resources: [
    {
      label: 'AI Sourcing',
      path: '/ai-candidate-sourcing-tool',
      icon: 'Search',
      description: 'Find candidates with AI matching'
    },
    {
      label: 'Interview Tools',
      path: '/video-interview-interface',
      icon: 'Video',
      description: 'Conduct and manage interviews'
    },
    {
      label: 'ATS Integration',
      path: '/ats-integration-management',
      icon: 'RefreshCw',
      description: 'Connect with your existing ATS'
    },
    {
      label: 'Talent Pool',
      path: '/talent-pool-management',
      icon: 'Database',
      description: 'Manage your talent database'
    },
    {
      label: 'DEI Initiatives',
      path: '/dei-dashboard',
      icon: 'Award',
      description: 'Track and improve diversity metrics'
    }
  ],
  profile: [
    {
      label: 'Company Profile',
      path: '/company-profile-management',
      icon: 'User',
      description: 'Manage your company profile'
    },
    {
      label: 'Company Settings',
      path: '/company-settings-dashboard',
      icon: 'Settings',
      description: 'Configure company preferences'
    },
    {
      label: 'Billing',
      path: '/billing-subscription-management',
      icon: 'CreditCard',
      description: 'Manage your billing and subscription'
    },
    {
      label: 'Notifications',
      path: '/notifications-center',
      icon: 'Bell',
      description: 'View all notifications'
    }
  ]
};

// Utility function to get navigation config by role
export const getNavigationByRole = (role) => {
  const roleMap = {
    'job_seeker': JOB_SEEKER_NAV,
    'recruiter': RECRUITER_NAV,
    'employer': EMPLOYER_NAV,
    'company': COMPANY_NAV,
    'administrator': ADMINISTRATOR_NAV
  };

  // Get the base navigation
  const nav = roleMap[role] || JOB_SEEKER_NAV;

  // Update profile path based on role
  const updatedNav = { ...nav };
  if (updatedNav.profile && updatedNav.profile.length > 0) {
    updatedNav.profile = [...updatedNav.profile];
    const profileIndex = updatedNav.profile.findIndex(item => item.icon === 'User' || item.icon === 'Building' || item.icon === 'Shield');
    if (profileIndex !== -1) {
      updatedNav.profile[profileIndex] = {
        ...updatedNav.profile[profileIndex],
        path: getRoleBasedProfilePath(role)
      };
    }
  }

  return updatedNav;
};

// Helper function to get role-based profile path
const getRoleBasedProfilePath = (role) => {
  switch (role) {
    case 'recruiter':
      return '/profile-management';
    case 'employer':
      return '/employer-profile-management';
    case 'company':
      return '/company-profile-management';
    case 'administrator':
      return '/admin-profile-management';
    case 'job_seeker':
    default:
      return '/profile-management';
  }
};

// Utility function to check if user has access to a specific route
export const hasRouteAccess = (userRole, routePath) => {
  const nav = getNavigationByRole(userRole);
  const allRoutes = [
    ...nav.main,
    ...nav.resources,
    ...nav.profile
  ];

  return allRoutes.some(route => route.path === routePath);
};

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  'administrator': 5,
  'company': 4,
  'employer': 3,
  'recruiter': 2,
  'job_seeker': 1
};

// Check if user role has higher or equal permission level
export const hasPermissionLevel = (userRole, requiredLevel) => {
  return ROLE_HIERARCHY[userRole] >= requiredLevel;
};
