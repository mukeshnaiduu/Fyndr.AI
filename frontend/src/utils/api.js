const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
  // Ensure endpoint always starts with / and does not double /api/
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Remove duplicate /api if present
  if (cleanEndpoint.startsWith('/api/api/')) {
    cleanEndpoint = cleanEndpoint.replace('/api/api/', '/api/');
  }
  
  // Ensure endpoint starts with /api/ if not already present
  if (!cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = `/api${cleanEndpoint}`;
  }
  
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  // Add Authorization header if token is provided
  if (token) {
    if (typeof token !== 'string' || token.trim() === '') {
      console.error('apiRequest - invalid token provided:', token);
      throw new Error('Invalid authentication token');
    }
    options.headers['Authorization'] = `Bearer ${token}`;
    console.log(`apiRequest - making ${method} request to ${cleanEndpoint} with auth token`);
  } else {
    console.log(`apiRequest - making ${method} request to ${cleanEndpoint} without auth token`);
  }
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  console.log(`apiRequest - Full URL: ${url}`);
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText };
      }
      
      console.error(`apiRequest - HTTP ${response.status} error:`, errorData);
      
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    
    const result = await response.json();
    console.log(`apiRequest - ${method} ${cleanEndpoint} success:`, result);
    return result;
  } catch (error) {
    console.error(`apiRequest - ${method} ${cleanEndpoint} failed:`, error);
    throw error;
  }
}
