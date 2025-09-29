import { useState, useEffect } from 'react';

interface Department {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  features: string[];
  services: string[];
  isActive: boolean;
  order: number;
  emergencyAvailable: boolean;
  contactInfo?: {
    phone?: string;
    email?: string;
    location?: string;
  };
  headOfDepartment?: {
    _id: string;
    name: string;
    specialization: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DepartmentResponse {
  success: boolean;
  data: {
    departments: Department[];
    pagination?: {
      current: number;
      pages: number;
      total: number;
    };
  };
  message?: string;
  note?: string;
}

export const usePublicDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/departments', {
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

      const result: DepartmentResponse = await response.json();
      if (result.success) {
        setDepartments(result.data.departments);
      } else {
        setError(result.message || 'Failed to fetch departments');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return { departments, loading, error, refetch: fetchDepartments };
};