import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Dashboard } from '@/components/admin/Dashboard';
import { DoctorManagement } from '@/components/admin/DoctorManagement';
import { DepartmentManagement } from '@/components/admin/DepartmentManagement';
import { ServiceManagement } from '@/components/admin/ServiceManagement';

function App() {
  return (
    <Router>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/doctors" element={<DoctorManagement />} />
          <Route path="/departments" element={<DepartmentManagement />} />
          <Route path="/services" element={<ServiceManagement />} />
        </Routes>
      </AdminLayout>
    </Router>
  );
}

export default App;
