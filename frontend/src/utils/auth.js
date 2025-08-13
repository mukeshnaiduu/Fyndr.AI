/**
 * Authentication utility functions
 */

// Clear invalid or expired tokens from localStorage
export function clearInvalidTokens() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  // Check if tokens look invalid
  const isInvalidToken = (token) => {
    return !token || 
           token === 'null' || 
           token === 'undefined' || 
           token.length < 10 ||
           token === 'invalid';
  };
  
  if (isInvalidToken(accessToken)) {
    console.warn('🧹 Clearing invalid access token');
    localStorage.removeItem('accessToken');
  }
  
  if (isInvalidToken(refreshToken)) {
    console.warn('🧹 Clearing invalid refresh token');
    localStorage.removeItem('refreshToken');
  }
}

// Check if user is authenticated with valid tokens
export function isAuthenticated() {
  const accessToken = localStorage.getItem('accessToken');
  return accessToken && 
         accessToken !== 'null' && 
         accessToken !== 'undefined' && 
         accessToken.length > 10;
}

// Get authentication status
export function getAuthStatus() {
  return {
    isAuthenticated: isAuthenticated(),
    hasAccessToken: !!localStorage.getItem('accessToken'),
    hasRefreshToken: !!localStorage.getItem('refreshToken')
  };
}

export default {
  clearInvalidTokens,
  isAuthenticated,
  getAuthStatus
};
