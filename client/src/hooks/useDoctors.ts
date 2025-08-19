import { useState, useEffect } from 'react';

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  department_id: number;
  department_name: string;
  photo_url: string;
  schedule: string;
  created_at: string;
  updated_at: string;
}

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctors');
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
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

  const createDoctor = async (doctorData: any) => {
    try {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData)
      });
      if (!response.ok) {
        throw new Error('Failed to create doctor');
      }
      await fetchDoctors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateDoctor = async (id: number, doctorData: any) => {
    try {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData)
      });
      if (!response.ok) {
        throw new Error('Failed to update doctor');
      }
      await fetchDoctors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteDoctor = async (id: number) => {
    try {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete doctor');
      }
      await fetchDoctors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return { doctors, loading, error, createDoctor, updateDoctor, deleteDoctor };
};
