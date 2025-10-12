import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDepartments } from '@/hooks/useDepartments';
import { DepartmentForm } from './DepartmentForm';
import { Building2, Plus, Edit, Trash2, Users, Briefcase, Calendar } from 'lucide-react';

export const DepartmentManagement: React.FC = () => {
  const { departments, loading, error, createDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingDepartment, setEditingDepartment] = React.useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleCreate = async (data: any) => {
    console.log('=== HANDLE CREATE DEPARTMENT ===');
    console.log('Received data in handleCreate:', data);
    console.log('Data type:', typeof data);
    console.log('Data keys:', Object.keys(data));
    
    try {
      await createDepartment(data);
      setIsAddDialogOpen(false);
      setSuccessMessage(`Department "${data.name}" has been successfully added!`);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error creating department:', error);
      alert('Failed to create department: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      if (!editingDepartment || !editingDepartment._id) {
        throw new Error('Invalid department data for update');
      }
      await updateDepartment(editingDepartment._id, data);
      setEditingDepartment(null);
      setSuccessMessage(`Department "${data.name}" has been successfully updated!`);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error updating department:', error);
      alert('Failed to update department: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(id);
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Failed to delete department: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <div className="text-lg text-slate-300">Loading departments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="p-4 bg-red-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="text-red-400 text-2xl">⚠️</div>
          </div>
          <p className="text-lg font-medium text-red-400">Error loading departments</p>
          <p className="text-sm text-slate-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl mr-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
            Department Management
          </h1>
        </div>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Organize and manage hospital departments with structured information
        </p>
      </div>

      {/* Stats and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{departments?.length || 0}</h3>
            <p className="text-slate-400">Total Departments</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {/* Using a simple count since we don't have doctor_count in the department object */}
              {departments?.filter(d => d.headOfDepartment).length || 0}
            </h3>
            <p className="text-slate-400">With Staff</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {/* Using a simple count since we don't have service_count in the department object */}
              {departments?.filter(d => d.services && d.services.length > 0).length || 0}
            </h3>
            <p className="text-slate-400">With Services</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Department */}
      <div className="flex justify-center">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-slate-800 border-slate-600">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Department</DialogTitle>
            </DialogHeader>
            <DepartmentForm onSubmit={handleCreate} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Departments Table */}
      <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Department Directory</CardTitle>
          <CardDescription className="text-slate-400">
            Manage Aditya Hospital's departments and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {departments && departments.length > 0 ? (
            <div className="border border-slate-600/30 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600/30 hover:bg-slate-700/30">
                    <TableHead className="text-slate-300 font-semibold">Department</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Description</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Created</TableHead>
                    <TableHead className="text-slate-300 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((department) => (
                    <TableRow key={department._id} className="border-slate-600/30 hover:bg-slate-700/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {department.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{department.name}</div>
                            <div className="text-xs text-slate-400">ID: {department._id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {department.description ? (
                            <p className="text-slate-300 text-sm line-clamp-2">{department.description}</p>
                          ) : (
                            <span className="text-slate-500 text-sm italic">No description</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-slate-300">
                          <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                          {new Date(department.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingDepartment(department)}
                            className="h-8 w-8 p-0 hover:bg-slate-600/50 text-slate-300 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(department._id)}
                            className="h-8 w-8 p-0 hover:bg-red-500/20 text-slate-300 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
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
              <div className="p-4 bg-slate-700/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">No departments found</h3>
              <p className="text-slate-400">Get started by adding your first department</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingDepartment && (
        <Dialog open={!!editingDepartment} onOpenChange={() => setEditingDepartment(null)}>
          <DialogContent className="max-w-2xl bg-slate-800 border-slate-600">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Department</DialogTitle>
            </DialogHeader>
            <DepartmentForm 
              department={editingDepartment} 
              onSubmit={handleUpdate} 
              onCancel={() => setEditingDepartment(null)} 
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Success Confirmation Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md bg-slate-800 border-slate-600">
          <DialogHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <div className="h-6 w-6 text-green-600">✓</div>
            </div>
            <DialogTitle className="text-white text-lg">Success!</DialogTitle>
          </DialogHeader>
          <div className="text-center">
            <p className="text-slate-300 mb-6">{successMessage}</p>
            <Button 
              onClick={() => setShowSuccessDialog(false)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};