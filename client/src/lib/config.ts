// API Configuration
// This file handles environment-specific API configuration

/// <reference types="vite/client" />

// Get API base URL from environment variable or use relative path
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Log the API base URL for debugging
console.log('[API Config] API_BASE_URL:', API_BASE_URL);

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  console.log('[API Config] Building URL for endpoint:', endpoint, 'cleaned:', cleanEndpoint);
  
  // If API_BASE_URL is set, use it; otherwise use relative path
  if (API_BASE_URL && API_BASE_URL !== '') {
    const url = `${API_BASE_URL}/${cleanEndpoint}`;
    console.log('[API Config] Using absolute URL:', url);
    return url;
  }
  
  // Use relative path (works with Vite proxy in dev and same-origin in production)
  const url = `/${cleanEndpoint}`;
  console.log('[API Config] Using relative URL:', url);
  return url;
};

// API endpoints - Remove /api prefix since buildApiUrl handles it
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  VERIFY: '/auth/verify',
  LOGOUT: '/auth/logout',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Departments
  DEPARTMENTS: '/departments',
  DEPARTMENT_BY_ID: (id: string) => `/departments/${id}`,
  
  // Doctors
  DOCTORS: '/doctors',
  DOCTOR_BY_ID: (id: string) => `/doctors/${id}`,
  
  // Services
  SERVICES: '/services',
  SERVICE_BY_ID: (id: string) => `/services/${id}`,
  
  // Health check
  HEALTH: '/health',
} as const;

// Environment configuration
export const CONFIG = {
  API_BASE_URL,
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
} as const;

// Helper for making authenticated requests
export const createAuthHeaders = (token?: string | null): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const authToken = token || localStorage.getItem('authToken');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

// Helper for API fetch with error handling
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  
  // Log the request for debugging
  console.log(`[API] Request to ${url}`, {
    method: options.method || 'GET',
    headers: options.headers
  });
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...createAuthHeaders(),
        ...options.headers,
      },
    });
    
    // Log the response for debugging
    console.log(`[API] Response from ${url}`, {
      status: response.status,
      statusText: response.statusText
    });
    
    // Handle 401 errors globally
    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Redirect to login if on admin page
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    
    return response;
  } catch (error) {
    console.error('[API] Request failed:', error);
    throw error;
  }
};