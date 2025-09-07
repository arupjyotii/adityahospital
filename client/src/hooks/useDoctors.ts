import { useState, useEffect } from 'react';

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  department_id: number | null;
  photo_url: string | null;
  schedule: string | null;
  created_at: string;
  updated_at: string;
  department_name: string | null;
}

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/doctors', {
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
      setDoctors(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createDoctor = async (doctorData: Omit<Doctor, 'id' | 'created_at' | 'updated_at' | 'department_name'>) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newDoctor = await response.json();
      setDoctors(prev => [...prev, { ...newDoctor, department_name: null }]);
      return newDoctor;
    } catch (err) {
      throw err;
    }
  };

  const updateDoctor = async (id: number, doctorData: Partial<Doctor>) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/doctors/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedDoctor = await response.json();
      setDoctors(prev => prev.map(doc => 
        doc.id === id ? { ...doc, ...updatedDoctor, department_name: doc.department_name } : doc
      ));
      return updatedDoctor;
    } catch (err) {
      throw err;
    }
  };

  const deleteDoctor = async (id: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/doctors/${id}`, {
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

      setDoctors(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return { doctors, loading, error, createDoctor, updateDoctor, deleteDoctor, refetch: fetchDoctors };
};
