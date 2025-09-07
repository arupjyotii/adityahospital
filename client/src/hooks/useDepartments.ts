import { useState, useEffect } from 'react';

interface Department {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  doctor_count: number;
  service_count: number;
}

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/departments', {
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

      const data = await response.json();
      setDepartments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (departmentData: Omit<Department, 'id' | 'created_at' | 'updated_at' | 'doctor_count' | 'service_count'>) => {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newDepartment = await response.json();
      setDepartments(prev => [...prev, { ...newDepartment, doctor_count: 0, service_count: 0 }]);
      return newDepartment;
    } catch (err) {
      throw err;
    }
  };

  const updateDepartment = async (id: number, departmentData: Partial<Department>) => {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedDepartment = await response.json();
      setDepartments(prev => prev.map(dept => 
        dept.id === id ? { ...dept, ...updatedDepartment } : dept
      ));
      return updatedDepartment;
    } catch (err) {
      throw err;
    }
  };

  const deleteDepartment = async (id: number) => {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setDepartments(prev => prev.filter(dept => dept.id !== id));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return { departments, loading, error, createDepartment, updateDepartment, deleteDepartment, refetch: fetchDepartments };
};
