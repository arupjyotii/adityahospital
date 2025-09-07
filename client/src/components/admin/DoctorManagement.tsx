import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDoctors } from '@/hooks/useDoctors';
import { DoctorForm } from './DoctorForm';
import { Users, Plus, Edit, Trash2, Mail, Phone, Search, Filter } from 'lucide-react';

export const DoctorManagement: React.FC = () => {
  const { doctors, loading, error, createDoctor, updateDoctor, deleteDoctor } = useDoctors();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingDoctor, setEditingDoctor] = React.useState<any>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleCreate = async (data: any) => {
    await createDoctor(data);
    setIsAddDialogOpen(false);
    setSuccessMessage(`Doctor "${data.name}" has been successfully added!`);
    setShowSuccessDialog(true);
  };

  const handleUpdate = async (data: any) => {
    await updateDoctor(editingDoctor.id, data);
    setEditingDoctor(null);
    setSuccessMessage(`Doctor "${data.name}" has been successfully updated!`);
    setShowSuccessDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      await deleteDoctor(id);
    }
  };

  const filteredDoctors = doctors?.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg text-slate-300">Loading doctors...</div>
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
          <p className="text-lg font-medium text-red-400">Error loading doctors</p>
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
          <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mr-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
            Doctor Management
          </h1>
        </div>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Manage doctor profiles, specializations, and department assignments with ease
        </p>
      </div>

      {/* Stats and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{doctors?.length || 0}</h3>
            <p className="text-slate-400">Total Doctors</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Filter className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {doctors?.filter(d => d.department_id).length || 0}
            </h3>
            <p className="text-slate-400">Assigned to Departments</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {doctors?.filter(d => d.specialization).length || 0}
            </h3>
            <p className="text-slate-400">With Specializations</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
          />
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-slate-800 border-slate-600">
            <DialogHeader>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-white text-xl">Add New Doctor</DialogTitle>
                  <p className="text-slate-400 text-sm">Create a new doctor profile</p>
                </div>
              </div>
            </DialogHeader>
            <DoctorForm onSubmit={handleCreate} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Doctors Table */}
      <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Doctor Directory</CardTitle>
          <CardDescription className="text-slate-400">
            Manage doctor profiles and their department assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDoctors && filteredDoctors.length > 0 ? (
            <div className="border border-slate-600/30 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600/30 hover:bg-slate-700/30">
                    <TableHead className="text-slate-300 font-semibold">Doctor</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Specialization</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Department</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Contact</TableHead>
                    <TableHead className="text-slate-300 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id} className="border-slate-600/30 hover:bg-slate-700/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {doctor.photo_url ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-600/30">
                              <img
                                src={doctor.photo_url}
                                alt={doctor.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to initials if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                        <span class="text-white font-semibold text-sm">
                                          ${doctor.name.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {doctor.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-white">{doctor.name}</div>
                            {doctor.photo_url && (
                              <div className="text-xs text-slate-400 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                Photo uploaded
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {doctor.specialization ? (
                          <Badge variant="secondary" className="bg-slate-700 text-slate-200 border-slate-600">
                            {doctor.specialization}
                          </Badge>
                        ) : (
                          <span className="text-slate-500 text-sm">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {doctor.department_name ? (
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                            {doctor.department_name}
                          </Badge>
                        ) : (
                          <span className="text-slate-500 text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {doctor.email && (
                            <div className="flex items-center text-sm text-slate-300">
                              <Mail className="h-3 w-3 mr-2 text-slate-400" />
                              {doctor.email}
                            </div>
                          )}
                          {doctor.phone && (
                            <div className="flex items-center text-sm text-slate-300">
                              <Phone className="h-3 w-3 mr-2 text-slate-400" />
                              {doctor.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingDoctor(doctor)}
                            className="h-8 w-8 p-0 hover:bg-slate-600/50 text-slate-300 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(doctor.id)}
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
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">No doctors found</h3>
              <p className="text-slate-400">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first doctor'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingDoctor && (
        <Dialog open={!!editingDoctor} onOpenChange={() => setEditingDoctor(null)}>
          <DialogContent className="max-w-2xl bg-slate-800 border-slate-600">
            <DialogHeader>
              <div className="flex items-center space-x-4 mb-4">
                {editingDoctor.photo_url ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-600/30">
                    <img
                      src={editingDoctor.photo_url}
                      alt={editingDoctor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                              <span class="text-white font-semibold text-lg">
                                ${editingDoctor.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {editingDoctor.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <DialogTitle className="text-white text-xl">Edit Doctor</DialogTitle>
                  <p className="text-slate-400 text-sm">Update {editingDoctor.name}'s information</p>
                </div>
              </div>
            </DialogHeader>
            <DoctorForm 
              doctor={editingDoctor} 
              onSubmit={handleUpdate} 
              onCancel={() => setEditingDoctor(null)} 
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
