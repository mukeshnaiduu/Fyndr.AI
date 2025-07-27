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

export async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
  const url = getApiUrl(endpoint);
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
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
      throw result;
    }
    return result;
  } catch (error) {
    // Re-throw with more context if it's a network or parsing error
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      throw new Error('Server returned invalid JSON response. This might be a server error.');
    }
    throw error;
  }
}
