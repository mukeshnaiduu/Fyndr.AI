// utils/signOut.js
// Utility to sign out the user: clears all auth and onboarding data and redirects to login

export function signOut() {
  // Remove all relevant localStorage/sessionStorage items
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('jobSeekerOnboardingData');
  localStorage.removeItem('jobSeekerOnboardingStep');
  localStorage.removeItem('jobSeekerOnboardingUserId');
  localStorage.removeItem('jobSeekerOnboardingComplete');
  // Add any other app-specific keys here

  // Optionally clear sessionStorage if used
  sessionStorage.clear();

  // Redirect to login page and force reload to clear all state
  window.location.href = '/authentication-login-register';
  setTimeout(() => window.location.reload(), 100);
}
