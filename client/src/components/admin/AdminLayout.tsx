import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, Briefcase, BarChart3, Menu, X, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { logout, user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3, description: 'Overview & analytics' },
    { name: 'Doctors', href: '/admin/doctors', icon: Users, description: 'Manage medical staff' },
    { name: 'Departments', href: '/admin/departments', icon: Building2, description: 'Hospital structure' },
    { name: 'Services', href: '/admin/services', icon: Briefcase, description: 'Medical services' }
  ];

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSidebar}></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-600/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl">
              <img 
                src="/logo.png" 
                alt="Hospital Logo" 
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Aditya Hospital
              </h1>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          </div>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-600/50 transition-colors"
            onClick={closeSidebar}
          >
            <X className="h-5 w-5 text-slate-300" />
          </button>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link key={item.name} to={item.href} onClick={closeSidebar}>
                <div className={`group relative p-1 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30' 
                    : 'hover:bg-slate-600/30'
                }`}>
                  <div className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' 
                      : 'group-hover:bg-slate-600/20'
                  }`}>
                    <div className={`p-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                        : 'bg-slate-600/50 text-slate-300 group-hover:bg-slate-500/50 group-hover:text-white'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={`font-medium transition-colors ${
                        isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                      }`}>
                        {item.name}
                      </p>
                      <p className={`text-xs transition-colors ${
                        isActive ? 'text-blue-200' : 'text-slate-400 group-hover:text-slate-300'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-600/50 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800">
          <div className="text-center mb-3">
            <p className="text-xs text-slate-400">v0.1.0</p>
            <p className="text-xs text-slate-500">Aditya Hospital's Admin Panel</p>
          </div>
          
          {/* User Info and Logout */}
          {user && (
            <div className="border-t border-slate-600/30 pt-3">
              <div className="text-center mb-3">
                <p className="text-sm text-slate-300 font-medium">{user.name}</p>
                <p className="text-xs text-slate-400">{user.role}</p>
              </div>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="w-full text-slate-300 hover:text-white hover:bg-slate-600/50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top header for mobile */}
        <div className="lg:hidden bg-slate-800/80 backdrop-blur-sm border-b border-slate-600/50 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg">
                <img 
                src="/logo.png" 
                alt="Hospital Logo" 
                className="h-10 w-10 object-contain"
              />
              </div>
              <h2 className="text-lg font-semibold text-white">Aditya Hospital</h2>
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="backdrop-blur-sm bg-slate-800/30 rounded-2xl border border-slate-600/30 shadow-2xl">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
