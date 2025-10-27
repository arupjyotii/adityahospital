import { useState, useEffect } from 'react';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  department_id: string | null;
  photo_url: string | null;
  schedule: string | null;
  created_at: string;
  updated_at: string;
  department_name: string | null;
  qualification: string;
  experience: number;
  bio: string;
}

// Transform API doctor object to match frontend interface
const transformDoctor = (apiDoctor: any): Doctor => {
  return {
    id: apiDoctor._id || apiDoctor.id,
    name: apiDoctor.name,
    email: apiDoctor.contactInfo?.email || '',
    phone: apiDoctor.contactInfo?.phone || '',
    specialization: apiDoctor.specialization,
    department_id: apiDoctor.department?._id || apiDoctor.departmentId || null,
    photo_url: apiDoctor.image || null,
    schedule: null,
    created_at: apiDoctor.createdAt || new Date().toISOString(),
    updated_at: apiDoctor.updatedAt || new Date().toISOString(),
    department_name: apiDoctor.department?.name || null,
    qualification: apiDoctor.qualification || '',
    experience: apiDoctor.experience || 0,
    bio: apiDoctor.bio || ''
  };
};

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

      const result = await response.json();
      const doctorsData = result.data?.doctors || result;
      const transformedDoctors = Array.isArray(doctorsData) 
        ? doctorsData.map(transformDoctor)
        : [transformDoctor(doctorsData)];
      setDoctors(transformedDoctors);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createDoctor = async (doctorData: Omit<Doctor, 'id' | 'created_at' | 'updated_at' | 'department_name' | 'schedule'>) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Transform the frontend data to match backend expectations
      const requestData: any = {
        name: doctorData.name,
        specialization: doctorData.specialization,
        qualification: doctorData.qualification,
        experience: Number(doctorData.experience),
        bio: doctorData.bio || '',
        image: doctorData.photo_url || '',
        contactInfo: {
          email: doctorData.email || '',
          phone: doctorData.phone || ''
        }
      };

      // Try different department field names that the backend might expect
      if (doctorData.department_id && doctorData.department_id !== 'no-department') {
        // Try departmentId first (most common), then department
        requestData.departmentId = doctorData.department_id;
        requestData.department = doctorData.department_id;
      }

      console.log('Sending doctor data:', requestData); // Debug log

      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData); // Debug log
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const newDoctor = result.data?.doctor || result;
      const transformedDoctor = transformDoctor(newDoctor);
      setDoctors(prev => [...prev, transformedDoctor]);
      return transformedDoctor;
    } catch (err) {
      throw err;
    }
  };

  const updateDoctor = async (id: string, doctorData: Partial<Doctor>) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Transform the frontend data to match backend expectations
      const requestData: any = {};
      
      // Add fields that are directly mapped
      if (doctorData.name !== undefined) requestData.name = doctorData.name;
      if (doctorData.specialization !== undefined) requestData.specialization = doctorData.specialization;
      if (doctorData.qualification !== undefined) requestData.qualification = doctorData.qualification;
      if (doctorData.experience !== undefined) requestData.experience = Number(doctorData.experience);
      if (doctorData.bio !== undefined) requestData.bio = doctorData.bio;
      if (doctorData.photo_url !== undefined) requestData.image = doctorData.photo_url;
      
      // Handle contact info
      if (doctorData.email !== undefined || doctorData.phone !== undefined) {
        requestData.contactInfo = {
          email: doctorData.email || '',
          phone: doctorData.phone || ''
        };
      }
      
      // Handle department field properly - try both field names
      if ('department_id' in doctorData && doctorData.department_id && doctorData.department_id !== 'no-department') {
        requestData.departmentId = doctorData.department_id;
        requestData.department = doctorData.department_id;
      }

      const response = await fetch(`/api/doctors/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const updatedDoctor = result.data?.doctor || result;
      const transformedDoctor = transformDoctor(updatedDoctor);
      setDoctors(prev => prev.map(doc => 
        doc.id === id ? transformedDoctor : doc
      ));
      return transformedDoctor;
    } catch (err) {
      throw err;
    }
  };

  const deleteDoctor = async (id: string) => {
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

  return { 
    doctors, 
    loading, 
    error, 
    createDoctor, 
    updateDoctor, 
    deleteDoctor, 
    refetch: fetchDoctors 
  };
};