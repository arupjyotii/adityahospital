// API Configuration
// This file handles environment-specific API configuration

/// <reference types="vite/client" />

// Get API base URL from environment variable or use relative path
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // If API_BASE_URL is set, use it; otherwise use relative path
  if (API_BASE_URL && API_BASE_URL !== '') {
    return `${API_BASE_URL}/${cleanEndpoint}`;
  }
  
  // Use relative path (works with Vite proxy in dev and same-origin in production)
  return `/${cleanEndpoint}`;
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/auth/login',
  VERIFY: '/api/auth/verify',
  LOGOUT: '/api/auth/logout',
  
  // Dashboard
  DASHBOARD: '/api/dashboard',
  
  // Departments
  DEPARTMENTS: '/api/departments',
  DEPARTMENT_BY_ID: (id: string) => `/api/departments/${id}`,
  
  // Doctors
  DOCTORS: '/api/doctors',
  DOCTOR_BY_ID: (id: string) => `/api/doctors/${id}`,
  
  // Services
  SERVICES: '/api/services',
  SERVICE_BY_ID: (id: string) => `/api/services/${id}`,
  
  // Public endpoints
  PUBLIC: {
    DEPARTMENTS: '/api/public/departments',
    DOCTORS: '/api/public/doctors',
    SERVICES: '/api/public/services',
  },
  
  // Health check
  HEALTH: '/api/health',
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
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...createAuthHeaders(),
        ...options.headers,
      },
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
    console.error('API request failed:', error);
    throw error;
  }
};