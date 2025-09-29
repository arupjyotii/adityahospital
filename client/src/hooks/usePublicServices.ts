import { useState, useEffect } from 'react';

interface Service {
  _id: string;
  name: string;
  description: string;
  department?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ServiceResponse {
  success: boolean;
  data: {
    services: Service[];
    pagination?: {
      current: number;
      pages: number;
      total: number;
    };
  };
  message?: string;
  note?: string;
}

export const usePublicServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/services', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned HTML instead of JSON. API endpoint may not exist.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ServiceResponse = await response.json();
      if (result.success) {
        setServices(result.data.services);
      } else {
        setError(result.message || 'Failed to fetch services');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return { services, loading, error, refetch: fetchServices };
};