import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Checks authentication and onboarding status, and redirects accordingly.
 * - If not authenticated, redirect to login/register.
 * - If authenticated but not onboarded, redirect to onboarding.
 * - If authenticated and onboarded, render the child route.
 *
 * @param {React.ReactNode} children
 * @param {string} role - userRole (job_seeker, recruiter, employer, administrator)
 * @param {boolean} requireOnboarding - if true, user must have completed onboarding
 */

import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, role, requireOnboarding = false }) => {
  const accessToken = localStorage.getItem('accessToken');
  const isAuthenticatedFlag = localStorage.getItem('isAuthenticated') === 'true';
  const isAuthenticated = !!accessToken && isAuthenticatedFlag;

  // Get user role from localStorage with fallback
  let userRole = localStorage.getItem('userRole');

  // Fallback: get role from user object if userRole is not set
  if (!userRole) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      userRole = user.role;
      if (userRole) {
        localStorage.setItem('userRole', userRole);
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }

  console.log('ProtectedRoute - userRole:', userRole, 'requireOnboarding:', requireOnboarding);

  const onboardingKey =
    userRole === 'job_seeker' || userRole === 'jobseeker'
      ? 'jobSeekerOnboardingComplete'
      : userRole === 'recruiter' || userRole === 'employer'
        ? 'recruiterOnboardingComplete'
        : userRole === 'administrator' || userRole === 'admin'
          ? 'adminOnboardingComplete'
          : null;

  const [isOnboarded, setIsOnboarded] = useState(onboardingKey ? localStorage.getItem(onboardingKey) === 'true' : true);

  useEffect(() => {
    // Fetch onboarding status from backend for robustness
    const fetchOnboardingStatus = async () => {
      // Ensure we have both authentication flag and valid token
      if (!isAuthenticated || !accessToken || accessToken.trim() === '') {
        console.log('ProtectedRoute - skipping onboarding check: no valid token');
        setIsOnboarded(false);
        return;
      }
      
      try {
        console.log('ProtectedRoute - fetching onboarding status for role:', userRole);
        const res = await fetch('/api/auth/profile/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          console.error('ProtectedRoute - profile fetch failed:', res.status, res.statusText);
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('ProtectedRoute - profile data received:', data);
        
        if (typeof data.onboarding_complete !== 'undefined') {
          const isComplete = !!data.onboarding_complete;
          if (userRole === 'job_seeker' || userRole === 'jobseeker') {
            localStorage.setItem('jobSeekerOnboardingComplete', isComplete ? 'true' : 'false');
          }
          if (userRole === 'recruiter' || userRole === 'employer') {
            localStorage.setItem('recruiterOnboardingComplete', isComplete ? 'true' : 'false');
          }
          if (userRole === 'administrator' || userRole === 'admin') {
            localStorage.setItem('adminOnboardingComplete', 'true');
          }
          setIsOnboarded(isComplete);
          console.log('ProtectedRoute - onboarding status updated:', isComplete, 'for role:', userRole);
        } else {
          console.log('ProtectedRoute - no onboarding_complete field in response');
          setIsOnboarded(false);
        }
      } catch (error) {
        console.error('ProtectedRoute - error fetching onboarding status:', error);
        setIsOnboarded(false);
      }
    };
    
    if (requireOnboarding && userRole) {
      fetchOnboardingStatus();
    }
    // eslint-disable-next-line
  }, [isAuthenticated, userRole, requireOnboarding, accessToken]);

  if (!isAuthenticated) {
    return <Navigate to="/authentication-login-register" replace />;
  }

  if (requireOnboarding && !isOnboarded) {
    console.log('ProtectedRoute - redirecting for onboarding, userRole:', userRole, 'isOnboarded:', isOnboarded);
    // Role-specific onboarding redirects
    if (userRole === 'job_seeker' || userRole === 'jobseeker') {
      return <Navigate to="/job-seeker-onboarding-wizard" replace />;
    }
    if (userRole === 'recruiter' || userRole === 'employer') {
      return <Navigate to="/recruiter-employer-onboarding-wizard" replace />;
    }
    if (userRole === 'administrator' || userRole === 'admin') {
      return <Navigate to="/admin-dashboard-system-management" replace />;
    }
    // Fallback for unknown roles - redirect to login
    console.log('ProtectedRoute - unknown role, redirecting to login:', userRole);
    return <Navigate to="/authentication-login-register" replace />;
  }

  return children;
};

export default ProtectedRoute;
