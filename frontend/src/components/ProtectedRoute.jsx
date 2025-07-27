import React from 'react';
import { Navigate } from 'react-router-dom';
import { getApiUrl } from 'utils/api';

/**
 * Checks authentication and onboarding status, and redirects accordingly.
 * - If not authenticated, redirect to login/register.
 * - If authenticated but not onboarded, redirect to onboarding.
 * - If authenticated and onboarded, render the child route.
 *
 * @param {React.ReactNode} children
 * @param {string} role - userRole (job_seeker, company, administrator)
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
      : userRole === 'recruiter'
        ? 'recruiterOnboardingComplete'
        : userRole === 'company'
          ? 'companyOnboardingComplete'
          : userRole === 'administrator' || userRole === 'admin'
            ? 'adminOnboardingComplete'
            : null;

  console.log('ProtectedRoute - localStorage check:', onboardingKey, localStorage.getItem(onboardingKey));

  const [isOnboarded, setIsOnboarded] = useState(onboardingKey ? localStorage.getItem(onboardingKey) === 'true' : true);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(requireOnboarding);

  console.log('ProtectedRoute - initial isOnboarded state:', isOnboarded, 'isCheckingOnboarding:', isCheckingOnboarding);

  useEffect(() => {
    if (!requireOnboarding || !isAuthenticated) {
      setIsCheckingOnboarding(false);
      return;
    }

    // Fetch onboarding status from backend for robustness
    const fetchOnboardingStatus = async () => {
      try {
        const apiUrl = getApiUrl('/auth/profile/');
        console.log('ProtectedRoute - Calling API:', apiUrl);

        const res = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();

        console.log('ProtectedRoute - API response onboarding_complete:', data.onboarding_complete);

        if (typeof data.onboarding_complete !== 'undefined') {
          const isComplete = !!data.onboarding_complete;

          // Update localStorage based on role
          if (userRole === 'job_seeker' || userRole === 'jobseeker') {
            localStorage.setItem('jobSeekerOnboardingComplete', isComplete ? 'true' : 'false');
          }
          if (userRole === 'recruiter') {
            localStorage.setItem('recruiterOnboardingComplete', isComplete ? 'true' : 'false');
          }
          if (userRole === 'company') {
            localStorage.setItem('companyOnboardingComplete', isComplete ? 'true' : 'false');
          }
          if (userRole === 'administrator' || userRole === 'admin') {
            localStorage.setItem('adminOnboardingComplete', 'true');
          }

          setIsOnboarded(isComplete);
          console.log('ProtectedRoute - Updated isOnboarded to:', isComplete);
        } else {
          setIsOnboarded(false);
          console.log('ProtectedRoute - No onboarding_complete field, setting to false');
        }
      } catch (error) {
        console.error('ProtectedRoute - API error:', error.message);
        // On error, trust localStorage
        const localValue = onboardingKey ? localStorage.getItem(onboardingKey) === 'true' : true;
        setIsOnboarded(localValue);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    fetchOnboardingStatus();
  }, [isAuthenticated, userRole, requireOnboarding, accessToken, onboardingKey]);

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/authentication-login-register" replace />;
  }

  // Don't redirect while still checking onboarding status from API
  if (requireOnboarding && isCheckingOnboarding) {
    console.log('ProtectedRoute - waiting for API check to complete');
    return <div style={{ padding: '20px' }}>Checking profile status...</div>;
  }

  if (requireOnboarding && !isOnboarded) {
    console.log(`ProtectedRoute - redirecting for onboarding - userRole: ${userRole}, isOnboarded: ${isOnboarded}`);
    // Role-specific onboarding redirects
    if (userRole === 'job_seeker' || userRole === 'jobseeker') {
      return <Navigate to="/job-seeker-onboarding-wizard" replace />;
    }
    if (userRole === 'recruiter') {
      return <Navigate to="/recruiter-onboarding-wizard" replace />;
    }
    if (userRole === 'company') {
      return <Navigate to="/company-onboarding-wizard" replace />;
    }
    if (userRole === 'administrator' || userRole === 'admin') {
      return <Navigate to="/admin-dashboard-system-management" replace />;
    }
    // Fallback for unknown roles - redirect to login
    console.log(`ProtectedRoute - unknown role, redirecting to login: ${userRole}`);
    return <Navigate to="/authentication-login-register" replace />;
  }

  console.log(`ProtectedRoute - Allowing access - requireOnboarding: ${requireOnboarding}, isOnboarded: ${isOnboarded}`);
  return children;
};

export default ProtectedRoute;
