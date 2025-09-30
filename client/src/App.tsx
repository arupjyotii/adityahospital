import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Dashboard } from '@/components/admin/Dashboard';
import { DoctorManagement } from '@/components/admin/DoctorManagement';
import { DepartmentManagement } from '@/components/admin/DepartmentManagement';
import { ServiceManagement } from '@/components/admin/ServiceManagement';
import { Login } from '@/components/admin/Login';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Website Components
import { WebsiteLayout } from '@/components/website/WebsiteLayout';
import { HomePage } from '@/components/website/HomePage';
import { AboutPage } from '@/components/website/AboutPage';
import { ContactPage } from '@/components/website/ContactPage';
import { AppointmentsPage } from '@/components/website/AppointmentsPage';
import { DepartmentsPage } from '@/components/website/DepartmentsPage';
import { ServicesPage } from '@/components/website/ServicesPage';
import { DoctorsPage } from '@/components/website/DoctorsPage';

function AppContent() {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={
            <WebsiteLayout>
              <HomePage />
            </WebsiteLayout>
          } />
          <Route path="/about" element={
            <WebsiteLayout>
              <AboutPage />
            </WebsiteLayout>
          } />
          <Route path="/contact" element={
            <WebsiteLayout>
              <ContactPage />
            </WebsiteLayout>
          } />
          <Route path="/appointments" element={
            <WebsiteLayout>
              <AppointmentsPage />
            </WebsiteLayout>
          } />
          <Route path="/departments" element={
            <WebsiteLayout>
              <DepartmentsPage />
            </WebsiteLayout>
          } />
          <Route path="/services" element={
            <WebsiteLayout>
              <ServicesPage />
            </WebsiteLayout>
          } />
          <Route path="/doctors" element={
            <WebsiteLayout>
              <DoctorsPage />
            </WebsiteLayout>
          } />
          
          {/* Admin Login Route */}
          <Route path="/admin/login" element={<Login onLogin={login} />} />
          
          {/* Redirect admin routes to login if not authenticated */}
          <Route path="/admin/*" element={<Login onLogin={login} />} />
          
          {/* Default redirect */}
          <Route path="*" element={
            <WebsiteLayout>
              <HomePage />
            </WebsiteLayout>
          } />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Admin Panel Routes */}
        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/doctors" element={<DoctorManagement />} />
              <Route path="/departments" element={<DepartmentManagement />} />
              <Route path="/services" element={<ServiceManagement />} />
            </Routes>
          </AdminLayout>
        } />
        
        {/* Public Website Routes (still accessible when logged in) */}
        <Route path="/" element={
          <WebsiteLayout>
            <HomePage />
          </WebsiteLayout>
        } />
        <Route path="/about" element={
          <WebsiteLayout>
            <AboutPage />
          </WebsiteLayout>
        } />
        <Route path="/contact" element={
          <WebsiteLayout>
            <ContactPage />
          </WebsiteLayout>
        } />
        <Route path="/appointments" element={
          <WebsiteLayout>
            <AppointmentsPage />
          </WebsiteLayout>
        } />
        <Route path="/departments" element={
          <WebsiteLayout>
            <DepartmentsPage />
          </WebsiteLayout>
        } />
        <Route path="/services" element={
          <WebsiteLayout>
            <ServicesPage />
          </WebsiteLayout>
        } />
        <Route path="/doctors" element={
          <WebsiteLayout>
            <DoctorsPage />
          </WebsiteLayout>
        } />
        
        {/* Default redirect */}
        <Route path="*" element={
          <WebsiteLayout>
            <HomePage />
          </WebsiteLayout>
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;