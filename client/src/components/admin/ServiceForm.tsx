import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDepartments } from '@/hooks/useDepartments';

interface ServiceFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { departments } = useDepartments();
  const [formData, setFormData] = React.useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    department_id: initialData?.department_id?.toString() || ''
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name" className="text-sm font-medium">Service Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter service name"
          required
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Brief description of the service"
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">Optional: Describe what this service offers</p>
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
        <p className="text-xs text-gray-500 mt-1">Choose which department this service belongs to</p>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update Service' : 'Add Service'}
        </Button>
      </div>
    </form>
  );
};
