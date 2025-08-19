import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Users, Building2, Briefcase, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 text-center">
          <p className="text-lg font-medium">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Doctors',
      value: data?.doctors || 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      bgColor: 'bg-blue-500'
    },
    {
      name: 'Total Departments',
      value: data?.departments || 0,
      icon: Building2,
      color: 'bg-green-50 text-green-600',
      bgColor: 'bg-green-500'
    },
    {
      name: 'Total Services',
      value: data?.services || 0,
      icon: Briefcase,
      color: 'bg-purple-50 text-purple-600',
      bgColor: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your hospital management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900">Manage Doctors</h3>
              <p className="text-sm text-gray-600 mt-1">Add, edit, or remove doctor profiles</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900">Organize Departments</h3>
              <p className="text-sm text-gray-600 mt-1">Structure your hospital departments</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900">Hospital Services</h3>
              <p className="text-sm text-gray-600 mt-1">Manage available medical services</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
