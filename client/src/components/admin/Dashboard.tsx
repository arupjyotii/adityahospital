import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Users, Building2, Briefcase, TrendingUp, Activity, Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { data, loading, error } = useDashboardData();
  const { isAuthenticated, user } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="p-4 bg-red-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="text-red-400 text-2xl">⚠️</div>
          </div>
          <p className="text-lg font-medium text-red-400">Access Denied</p>
          <p className="text-sm text-slate-400 mt-2">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg text-slate-300">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="p-4 bg-red-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="text-red-400 text-2xl">⚠️</div>
          </div>
          <p className="text-lg font-medium text-red-400">Error loading dashboard</p>
          <p className="text-sm text-slate-400 mt-2">{error}</p>
          {error.includes('404') && (
            <p className="text-xs text-slate-500 mt-2">
              The dashboard API endpoint could not be found. Please check:
              <br />1. The backend server is running
              <br />2. The API endpoint is correctly configured
              <br />3. The proxy settings in vite.config.js
            </p>
          )}
          {error.includes('Authentication') && (
            <p className="text-xs text-slate-500 mt-2">
              Please try logging out and logging back in.
            </p>
          )}
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Doctors',
      value: data?.doctors || 0,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      description: 'Active medical staff'
    },
    {
      name: 'Total Departments',
      value: data?.departments || 0,
      icon: Building2,
      gradient: 'from-emerald-500 to-green-500',
      bgGradient: 'from-emerald-500/20 to-green-500/20',
      borderColor: 'border-emerald-500/30',
      description: 'Hospital divisions'
    },
    {
      name: 'Total Services',
      value: data?.services || 0,
      icon: Briefcase,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      description: 'Available treatments'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Doctors',
      description: 'Add, edit, or remove doctor profiles',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      href: '/admin/doctors'
    },
    {
      title: 'Organize Departments',
      description: 'Structure your hospital departments',
      icon: Building2,
      gradient: 'from-emerald-500 to-green-500',
      href: '/admin/departments'
    },
    {
      title: 'Hospital Services',
      description: 'Manage available medical services',
      icon: Briefcase,
      gradient: 'from-purple-500 to-pink-500',
      href: '/admin/services'
    }
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent mb-3">
          Welcome Back to the{user?.profile?.firstName ? ` ${user.profile.firstName}` : ''}
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Monitor key metrics and access quick actions below
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="group relative overflow-hidden border-0 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm hover:scale-105 transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-400 mb-1">{stat.name}</p>
                    <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.description}</p>
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="flex items-center justify-center text-2xl font-bold text-white">
            <TrendingUp className="h-6 w-6 mr-3 text-blue-400" />
            Quick Actions
          </CardTitle>
          <p className="text-slate-400 mt-2">Access key management functions</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.title}
                  href={action.href}
                  className="group block p-6 rounded-xl border border-slate-600/30 bg-slate-800/30 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-300 hover:scale-105"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.gradient} mb-4 shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-slate-200 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    {action.description}
                  </p>
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">System Status</h3>
                <p className="text-sm text-slate-400">All systems operational</p>
              </div>
              <div className="ml-auto">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Last Updated</h3>
                <p className="text-sm text-slate-400">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};