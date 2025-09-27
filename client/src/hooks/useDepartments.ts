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

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/departments', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
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

      const result: DepartmentResponse = await response.json();
      if (result.success) {
        setDepartments(result.data.departments);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch departments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (departmentData: Omit<Department, '_id' | 'createdAt' | 'updatedAt' | 'slug'>) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(departmentData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setDepartments(prev => [...prev, result.data.department]);
        return result.data.department;
      } else {
        throw new Error(result.message || 'Failed to create department');
      }
    } catch (err) {
      throw err;
    }
  };

  const updateDepartment = async (id: string, departmentData: Partial<Department>) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/departments/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(departmentData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setDepartments(prev => prev.map(dept => 
          dept._id === id ? { ...dept, ...result.data.department } : dept
        ));
        return result.data.department;
      } else {
        throw new Error(result.message || 'Failed to update department');
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/departments/${id}`, {
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
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setDepartments(prev => prev.filter(dept => dept._id !== id));
      } else {
        throw new Error(result.message || 'Failed to delete department');
      }
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return { departments, loading, error, createDepartment, updateDepartment, deleteDepartment, refetch: fetchDepartments };
};
