// Get API URL with fallback
const getApiUrl = () => {
  return window.REACT_APP_API_URL || 'http://localhost:5000';
};

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to create headers with auth
const createHeaders = (contentType = 'application/json') => {
  const headers = {
    'Content-Type': contentType,
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${getApiUrl()}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      ...createHeaders(),
      ...options.headers,
    },
  };

  try {
    console.log('Making API request to:', url);
    
    const response = await fetch(url, config);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server did not return JSON response');
    }

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error status codes
      if (response.status === 401) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/auth';
        throw new Error('Session expired. Please login again.');
      }
      
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please check your internet connection.');
    }
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  login: async (email, password) => {
    return apiRequest('/api/v1/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile: async () => {
    return apiRequest('/api/v1/users/profile');
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },
};

// Generic API functions for other endpoints
export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  patch: (endpoint, data) => apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

export default api;