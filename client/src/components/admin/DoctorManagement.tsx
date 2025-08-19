import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDoctors } from '@/hooks/useDoctors';
import { DoctorForm } from './DoctorForm';
import { Users, Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';

export const DoctorManagement: React.FC = () => {
  const { doctors, loading, error, createDoctor, updateDoctor, deleteDoctor } = useDoctors();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingDoctor, setEditingDoctor] = React.useState<any>(null);

  const handleCreate = async (data: any) => {
    await createDoctor(data);
    setIsAddDialogOpen(false);
  };

  const handleUpdate = async (data: any) => {
    await updateDoctor(editingDoctor.id, data);
    setEditingDoctor(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      await deleteDoctor(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading doctors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 text-center">
          <p className="text-lg font-medium">Error loading doctors</p>
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
            <Users className="h-8 w-8 mr-3" />
            Doctor Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage doctor profiles, specializations, and assignments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
            </DialogHeader>
            <DoctorForm onSubmit={handleCreate} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Overview</CardTitle>
          <CardDescription>
            Total doctors: {doctors?.length || 0}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Doctors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Doctors</CardTitle>
          <CardDescription>
            Manage doctor profiles and their department assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {doctors && doctors.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">Specialization</TableHead>
                      <TableHead className="font-semibold">Department</TableHead>
                      <TableHead className="font-semibold">Schedule</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.map((doctor) => (
                      <TableRow key={doctor.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {doctor.photo_url ? (
                              <img
                                src={doctor.photo_url}
                                alt={doctor.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{doctor.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {doctor.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-4 w-4 mr-1" />
                                {doctor.email}
                              </div>
                            )}
                            {doctor.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-1" />
                                {doctor.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {doctor.specialization ? (
                            <Badge variant="secondary">{doctor.specialization}</Badge>
                          ) : (
                            <span className="text-gray-500 text-sm">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {doctor.department_name ? (
                            <Badge variant="outline">{doctor.department_name}</Badge>
                          ) : (
                            <span className="text-gray-500 text-sm">No department</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {doctor.schedule || 'Not specified'}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingDoctor(doctor)}
                              className="flex items-center"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(doctor.id)}
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
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No doctors found</p>
              <p className="text-sm text-gray-500 mt-1">Add your first doctor to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingDoctor && (
        <Dialog open={true} onOpenChange={() => setEditingDoctor(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Doctor</DialogTitle>
            </DialogHeader>
            <DoctorForm
              initialData={editingDoctor}
              onSubmit={handleUpdate}
              onCancel={() => setEditingDoctor(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
