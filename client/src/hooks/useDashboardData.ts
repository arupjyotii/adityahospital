import { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiFetch } from '../lib/config';
import { useAuth } from '../contexts/AuthContext';

interface DashboardData {
  doctors: number;
  departments: number;
  services: number;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated || !token) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const response = await apiFetch(API_ENDPOINTS.DASHBOARD);

        if (!response.ok) {
          // Handle different HTTP status codes more specifically
          switch (response.status) {
            case 401:
              setError('Authentication required. Please log in.');
              break;
            case 403:
              setError('Access denied. Insufficient permissions.');
              break;
            case 404:
              setError('Dashboard endpoint not found. Please check API configuration.');
              break;
            case 500:
              setError('Server error. Please try again later.');
              break;
            default:
              setError(`HTTP error! status: ${response.status}`);
          }
          setLoading(false);
          return;
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token]);

  return { data, loading, error };
};