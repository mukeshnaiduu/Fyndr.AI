/**
 * Role-based profile routing utility
 * Redirects users to the appropriate profile management page based on their role
 */

import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const useRoleBasedProfileRedirect = () => {
  const navigate = useNavigate();

  const redirectToRoleProfile = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    switch (user.role) {
      case 'recruiter':
        navigate('/recruiter-profile-management');
        break;
      case 'employer':
        navigate('/employer-profile-management');
        break;
      case 'administrator':
        navigate('/admin-profile-management');
        break;
      case 'job_seeker':
      default:
        navigate('/profile-management');
        break;
    }
  };

  return { redirectToRoleProfile };
};

export const getRoleBasedProfilePath = (role) => {
  switch (role) {
    case 'recruiter':
      return '/recruiter-profile-management';
    case 'employer':
      return '/employer-profile-management';
    case 'administrator':
      return '/admin-profile-management';
    case 'job_seeker':
    default:
      return '/profile-management';
  }
};

export const getRoleBasedDashboardPath = (role) => {
  switch (role) {
    case 'recruiter':
    case 'employer':
      return '/recruiter-dashboard-pipeline-management';
    case 'administrator':
      return '/admin-dashboard-system-management';
    case 'job_seeker':
    default:
      return '/ai-powered-job-feed-dashboard';
  }
};

// Component for automatic role-based redirection
export const RoleBasedProfileRedirect = () => {
  const { redirectToRoleProfile } = useRoleBasedProfileRedirect();

  useEffect(() => {
    redirectToRoleProfile();
  }, [redirectToRoleProfile]);

  return null;
};
