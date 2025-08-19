import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Doctors', href: '/doctors' },
    { name: 'Departments', href: '/departments' },
    { name: 'Services', href: '/services' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <nav className="mt-8">
            {navigation.map((item) => (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={location.pathname === item.href ? "default" : "ghost"}
                  className="w-full justify-start mb-2 mx-4"
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-1 p-8">
          <Card className="p-6">
            {children}
          </Card>
        </div>
      </div>
    </div>
  );
};
