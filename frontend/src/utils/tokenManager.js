/**
 * Token Manager - Handles JWT token refresh and authentication state
 * 
 * Provides automatic token refresh functionality and centralized token management
 */

class TokenManager {
  constructor() {
    this.refreshPromise = null; // Prevent multiple concurrent refresh attempts
    this.isRefreshing = false;
  }

  /**
   * Get the current access token
   */
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get the current refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Check if access token is expired
   */
  isAccessTokenExpired() {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      // Decode JWT payload (without verification since we're just checking expiration)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Add 30 second buffer before expiration
      return payload.exp < (currentTime + 30);
    } catch (error) {
      console.warn('Failed to decode access token:', error);
      return true;
    }
  }

  /**
   * Check if refresh token is expired
   */
  isRefreshTokenExpired() {
    const token = this.getRefreshToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.warn('Failed to decode refresh token:', error);
      return true;
    }
  }

  /**
   * Refresh the access token using the refresh token
   */
  async refreshAccessToken() {
    // Prevent multiple concurrent refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken || this.isRefreshTokenExpired()) {
      console.warn('No valid refresh token available');
      this.clearTokens();
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performTokenRefresh(refreshToken);

    try {
      const result = await this.refreshPromise;
      this.isRefreshing = false;
      this.refreshPromise = null;
      return result;
    } catch (error) {
      this.isRefreshing = false;
      this.refreshPromise = null;
      throw error;
    }
  }

  /**
   * Perform the actual token refresh API call
   */
  async _performTokenRefresh(refreshToken) {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      const url = `${baseURL}/auth/token/refresh/`;

      console.log('🔄 Refreshing access token...');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Token refresh failed:', response.status, errorData);
        
        if (response.status === 401) {
          // Refresh token is invalid/expired
          this.clearTokens();
          throw new Error('REFRESH_TOKEN_EXPIRED');
        }
        
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.access) {
        throw new Error('No access token in refresh response');
      }

      // Update stored tokens
      localStorage.setItem('accessToken', data.access);
      if (data.refresh) {
        localStorage.setItem('refreshToken', data.refresh);
      }

      console.log('✅ Access token refreshed successfully');
      return data.access;

    } catch (error) {
      console.error('Error refreshing token:', error);
      
      if (error.message === 'REFRESH_TOKEN_EXPIRED') {
        this.clearTokens();
      }
      
      throw error;
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getValidAccessToken() {
    const accessToken = this.getAccessToken();
    
    if (!accessToken) {
      throw new Error('NO_ACCESS_TOKEN');
    }

    if (this.isAccessTokenExpired()) {
      console.log('🔄 Access token expired, refreshing...');
      return await this.refreshAccessToken();
    }

    return accessToken;
  }

  /**
   * Clear all stored tokens and authentication state
   */
  clearTokens() {
    console.log('🗑️ Clearing authentication tokens');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.setItem('isAuthenticated', 'false');
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('authStateChanged', {
      detail: { authenticated: false, reason: 'tokens_cleared' }
    }));
  }

  /**
   * Handle 401 response by attempting token refresh
   */
  async handle401Error() {
    try {
      const newToken = await this.refreshAccessToken();
      return newToken;
    } catch (error) {
      console.warn('Failed to refresh token on 401:', error.message);
      this.clearTokens();
      throw new Error('AUTHENTICATION_FAILED');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const isAuthFlag = localStorage.getItem('isAuthenticated') === 'true';
    
    return !!(accessToken && refreshToken && isAuthFlag);
  }

  /**
   * Set authentication tokens
   */
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('isAuthenticated', 'true');
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('authStateChanged', {
      detail: { authenticated: true, reason: 'tokens_set' }
    }));
  }
}

// Create singleton instance
const tokenManager = new TokenManager();

export default tokenManager;
