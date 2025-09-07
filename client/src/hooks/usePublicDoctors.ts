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

export const usePublicDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/public/doctors', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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

  useEffect(() => {
    fetchDoctors();
  }, []);

  return { doctors, loading, error, refetch: fetchDoctors };
};
