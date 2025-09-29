import { useState, useEffect } from 'react';

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  department?: {
    _id: string;
    name: string;
  };
  image?: string;
  schedule?: string;
  isActive: boolean;
  experience: string;
  qualification: string;
  createdAt: string;
  updatedAt: string;
}

interface DoctorResponse {
  success: boolean;
  data: {
    doctors: Doctor[];
    pagination?: {
      current: number;
      pages: number;
      total: number;
    };
  };
  message?: string;
  note?: string;
}

export const usePublicDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/doctors', {
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

      const result: DoctorResponse = await response.json();
      if (result.success) {
        setDoctors(result.data.doctors);
      } else {
        setError(result.message || 'Failed to fetch doctors');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return { doctors, loading, error, refetch: fetchDoctors };
};