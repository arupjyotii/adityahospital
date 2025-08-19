import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDepartments } from '@/hooks/useDepartments';
import { DepartmentForm } from './DepartmentForm';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';

export const DepartmentManagement: React.FC = () => {
  const { departments, loading, error, createDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingDepartment, setEditingDepartment] = React.useState<any>(null);

  const handleCreate = async (data: any) => {
    await createDepartment(data);
    setIsAddDialogOpen(false);
  };

  const handleUpdate = async (data: any) => {
    await updateDepartment(editingDepartment.id, data);
    setEditingDepartment(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this department?')) {
      await deleteDepartment(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading departments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 text-center">
          <p className="text-lg font-medium">Error loading departments</p>
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
            <Building2 className="h-8 w-8 mr-3" />
            Department Management
          </h1>
          <p className="mt-2 text-gray-600">
            Organize and manage hospital departments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <DepartmentForm onSubmit={handleCreate} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Overview</CardTitle>
          <CardDescription>
            Total departments: {departments?.length || 0}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
          <CardDescription>
            Manage your hospital departments and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {departments && departments.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((department) => (
                    <TableRow key={department.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{department.name}</TableCell>
                      <TableCell className="text-gray-600">
                        {department.description || 'No description'}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingDepartment(department)}
                            className="flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(department.id)}
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
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No departments found</p>
              <p className="text-sm text-gray-500 mt-1">Create your first department to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingDepartment && (
        <Dialog open={true} onOpenChange={() => setEditingDepartment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
            </DialogHeader>
            <DepartmentForm
              initialData={editingDepartment}
              onSubmit={handleUpdate}
              onCancel={() => setEditingDepartment(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
