import tokenManager from './tokenManager.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Helper function to construct proper API URLs
export function getApiUrl(endpoint) {
  // Clean endpoint - ensure it starts with /
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If API_BASE_URL ends with /api and endpoint starts with /api, remove the duplicate
  if (API_BASE_URL.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4); // Remove '/api' from start
  }

  return `${API_BASE_URL}${cleanEndpoint}`;
}

// Helper function to get authentication headers
function getAuthHeaders(token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Use provided token or get from tokenManager
  const authToken = token || tokenManager.getAccessToken();

  // Only add auth header if token exists and looks valid
  if (authToken && authToken !== 'null' && authToken !== 'undefined' && authToken.length > 10) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return headers;
}

export async function apiRequest(endpoint, method = 'GET', data = null, customToken = null) {
  const url = getApiUrl(endpoint);

  try {
    // Get valid access token (will refresh if necessary)
    let authToken = customToken;
    if (!authToken && tokenManager.isAuthenticated()) {
      try {
        authToken = await tokenManager.getValidAccessToken();
      } catch (error) {
        if (error.message === 'NO_ACCESS_TOKEN' || error.message === 'REFRESH_TOKEN_EXPIRED') {
          console.warn('🔐 No valid authentication tokens available');
          tokenManager.clearTokens();
        }
        // Continue without auth token for public endpoints
      }
    }

    const headers = getAuthHeaders(authToken);
    const options = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    // Check if response is HTML (error page)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      if (textResponse.includes('<!DOCTYPE html>')) {
        throw new Error(`Server returned HTML error page. Status: ${response.status} ${response.statusText}`);
      }
      throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 200)}`);
    }

    const result = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized - attempt token refresh ONCE
      if (response.status === 401 && !customToken && tokenManager.isAuthenticated()) {
        console.warn('🔐 401 Unauthorized - attempting token refresh...');

        try {
          const newToken = await tokenManager.handle401Error();

          // Retry the request with the new token
          console.log('🔄 Retrying request with refreshed token...');
          const retryHeaders = getAuthHeaders(newToken);
          const retryOptions = { ...options, headers: retryHeaders };

          const retryResponse = await fetch(url, retryOptions);
          const retryResult = await retryResponse.json();

          if (!retryResponse.ok) {
            console.error('Request failed even after token refresh:', retryResponse.status);
            throw new Error(retryResult.detail || retryResult.message || `HTTP error! status: ${retryResponse.status}`);
          }

          return retryResult;

        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError.message);
          if (refreshError.message === 'AUTHENTICATION_FAILED') {
            throw new Error('Authentication required - please log in again');
          }
          throw refreshError;
        }
      }

      // Build a more helpful error message if API returned field errors
      let message = result && (result.detail || result.message);
      if (!message && result && typeof result === 'object') {
        try {
          const entries = Object.entries(result);
          if (entries.length > 0) {
            const sample = entries.slice(0, 3).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : (typeof v === 'object' ? JSON.stringify(v) : String(v))}`);
            message = sample.join(' | ');
          }
        } catch { /* noop */ }
      }
      throw new Error(message || `HTTP error! status: ${response.status}`);
    }

    return result;

  } catch (error) {
    // Re-throw with more context if it's a network or parsing error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to server at ${url}`);
    }
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      throw new Error('Server returned invalid JSON response. This might be a server error.');
    }

    throw error;
  }
}

// Multipart/form-data request helper (for file uploads). Do not set Content-Type manually.
export async function apiFormRequest(endpoint, method = 'POST', formData, customToken = null) {
  const url = getApiUrl(endpoint);

  try {
    // Get valid access token (will refresh if necessary)
    let authToken = customToken;
    if (!authToken && tokenManager.isAuthenticated()) {
      try {
        authToken = await tokenManager.getValidAccessToken();
      } catch (error) {
        if (error.message === 'NO_ACCESS_TOKEN' || error.message === 'REFRESH_TOKEN_EXPIRED') {
          console.warn('🔐 No valid authentication tokens available');
          tokenManager.clearTokens();
        }
        // Continue without auth token for public endpoints
      }
    }

    const headers = {};
    if (authToken && authToken !== 'null' && authToken !== 'undefined' && authToken.length > 10) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const options = {
      method,
      headers,
      body: formData,
    };

    const response = await fetch(url, options);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      if (textResponse.includes('<!DOCTYPE html>')) {
        throw new Error(`Server returned HTML error page. Status: ${response.status} ${response.statusText}`);
      }
      throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 200)}`);
    }

    const result = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized - attempt token refresh ONCE
      if (response.status === 401 && !customToken && tokenManager.isAuthenticated()) {
        console.warn('🔐 401 Unauthorized (multipart) - attempting token refresh...');
        try {
          const newToken = await tokenManager.handle401Error();
          const retryHeaders = { Authorization: `Bearer ${newToken}` };
          const retryResponse = await fetch(url, { method, headers: retryHeaders, body: formData });
          const retryResult = await retryResponse.json();
          if (!retryResponse.ok) {
            throw new Error(retryResult.detail || retryResult.message || `HTTP error! status: ${retryResponse.status}`);
          }
          return retryResult;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError.message);
          if (refreshError.message === 'AUTHENTICATION_FAILED') {
            throw new Error('Authentication required - please log in again');
          }
          throw refreshError;
        }
      }
      throw new Error(result.detail || result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to server at ${url}`);
    }
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      throw new Error('Server returned invalid JSON response. This might be a server error.');
    }
    throw error;
  }
}
