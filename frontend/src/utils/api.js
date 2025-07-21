const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
  // Ensure endpoint always starts with / and does not double /api/
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Remove duplicate /api if present
  if (cleanEndpoint.startsWith('/api/api/')) {
    cleanEndpoint = cleanEndpoint.replace('/api/api/', '/api/');
  }
  const url = `${API_BASE_URL}${cleanEndpoint}`;
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
  const response = await fetch(url, options);
  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result;
}
