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
          throw new Error(`HTTP error! status: ${response.status}`);
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