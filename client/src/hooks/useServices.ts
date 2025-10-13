import { useState, useEffect } from 'react';

interface Service {
  id: string; // Changed from number to string to match MongoDB _id
  name: string;
  description: string;
  department_id: string | null;
  created_at: string;
  updated_at: string;
  department_name: string | null;
}

// Transform API service object to match frontend interface
const transformService = (apiService: any): Service => {
  return {
    id: apiService._id || apiService.id,
    name: apiService.name,
    description: apiService.description,
    department_id: apiService.department?._id || apiService.department || null,
    created_at: apiService.createdAt || new Date().toISOString(),
    updated_at: apiService.updatedAt || new Date().toISOString(),
    department_name: apiService.department?.name || null
  };
};

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/services', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please login again.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.reload();
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }

      const result = await response.json();
      // Extract services array from the API response structure
      const servicesData = result.data?.services || result;
      // Transform API services to match frontend interface
      const transformedServices = Array.isArray(servicesData) 
        ? servicesData.map(transformService)
        : [transformService(servicesData)];
      setServices(transformedServices);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'department_name'>) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // Extract service from the API response structure
      const newService = result.data?.service || result;
      // Transform API service to match frontend interface
      const transformedService = transformService(newService);
      setServices(prev => [...prev, transformedService]);
      return transformedService;
    } catch (err) {
      throw err;
    }
  };

  const updateService = async (id: string, serviceData: Partial<Service>) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // Extract service from the API response structure
      const updatedService = result.data?.service || result;
      // Transform API service to match frontend interface
      const transformedService = transformService(updatedService);
      setServices(prev => prev.map(service => 
        service.id === id ? transformedService : service
      ));
      return transformedService;
    } catch (err) {
      throw err;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setServices(prev => prev.filter(service => service.id !== id));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return { services, loading, error, createService, updateService, deleteService, refetch: fetchServices };
};