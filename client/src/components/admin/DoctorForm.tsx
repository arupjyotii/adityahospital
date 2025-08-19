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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            value={formData.specialization}
            onChange={(e) => handleChange('specialization', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="department">Department</Label>
        <Select value={formData.department_id} onValueChange={(value) => handleChange('department_id', value)}>
          <SelectTrigger>
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
        <Label htmlFor="photo_url">Photo URL</Label>
        <Input
          id="photo_url"
          value={formData.photo_url}
          onChange={(e) => handleChange('photo_url', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="schedule">Schedule</Label>
        <Input
          id="schedule"
          value={formData.schedule}
          onChange={(e) => handleChange('schedule', e.target.value)}
          placeholder="e.g., Mon-Fri 9AM-5PM"
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
