import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDepartments } from '@/hooks/useDepartments';

interface DoctorFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const DoctorForm: React.FC<DoctorFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { departments } = useDepartments();
  const [formData, setFormData] = React.useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    specialization: initialData?.specialization || '',
    department_id: initialData?.department_id?.toString() || '',
    photo_url: initialData?.photo_url || '',
    schedule: initialData?.schedule || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      department_id: formData.department_id ? parseInt(formData.department_id) : null
    };
    onSubmit(submitData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter doctor's full name"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="doctor@hospital.com"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="specialization" className="text-sm font-medium">Specialization</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) => handleChange('specialization', e.target.value)}
              placeholder="e.g., Cardiology, Pediatrics"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="department" className="text-sm font-medium">Department</Label>
          <Select value={formData.department_id} onValueChange={(value) => handleChange('department_id', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select department (optional)" />
            </SelectTrigger>
            <SelectContent>
              {departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="photo_url" className="text-sm font-medium">Photo URL</Label>
          <Input
            id="photo_url"
            value={formData.photo_url}
            onChange={(e) => handleChange('photo_url', e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Optional: Enter a URL for the doctor's photo</p>
        </div>

        <div>
          <Label htmlFor="schedule" className="text-sm font-medium">Schedule</Label>
          <Input
            id="schedule"
            value={formData.schedule}
            onChange={(e) => handleChange('schedule', e.target.value)}
            placeholder="e.g., Mon-Fri 9AM-5PM, Sat 10AM-2PM"
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Enter working hours and days</p>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Doctor' : 'Add Doctor'}
          </Button>
        </div>
      </form>
    </div>
  );
};
