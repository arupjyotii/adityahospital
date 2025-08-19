import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useServices } from '@/hooks/useServices';
import { ServiceForm } from './ServiceForm';
import { Briefcase, Plus, Edit, Trash2 } from 'lucide-react';

export const ServiceManagement: React.FC = () => {
  const { services, loading, error, createService, updateService, deleteService } = useServices();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<any>(null);

  const handleCreate = async (data: any) => {
    await createService(data);
    setIsAddDialogOpen(false);
  };

  const handleUpdate = async (data: any) => {
    await updateService(editingService.id, data);
    setEditingService(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      await deleteService(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 text-center">
          <p className="text-lg font-medium">Error loading services</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Briefcase className="h-8 w-8 mr-3" />
            Service Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage hospital services and their department assignments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <ServiceForm onSubmit={handleCreate} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Overview</CardTitle>
          <CardDescription>
            Total services: {services?.length || 0}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>
            Manage your hospital services and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {services && services.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="text-gray-600 max-w-xs">
                        <div className="truncate">
                          {service.description || 'No description'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {service.department_name ? (
                          <Badge variant="outline">{service.department_name}</Badge>
                        ) : (
                          <span className="text-gray-500 text-sm">No department</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingService(service)}
                            className="flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(service.id)}
                            className="flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No services found</p>
              <p className="text-sm text-gray-500 mt-1">Create your first service to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingService && (
        <Dialog open={true} onOpenChange={() => setEditingService(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
            </DialogHeader>
            <ServiceForm
              initialData={editingService}
              onSubmit={handleUpdate}
              onCancel={() => setEditingService(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
