import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDepartments } from '@/hooks/useDepartments';
import { Briefcase, FileText, Building2 } from 'lucide-react';

interface ServiceFormProps {
  service?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSubmit, onCancel }) => {
  const { departments } = useDepartments();
  const [formData, setFormData] = React.useState({
    name: service?.name || '',
    description: service?.description || '',
    department_id: service?.department_id?.toString() || ''
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
      {/* Service Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Briefcase className="h-5 w-5 mr-2 text-purple-400" />
          Service Information
        </h3>
        
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-slate-300">Service Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter service name"
            required
            className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-slate-300">Description</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of the service"
              className="mt-1 pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-slate-500">Optional: Describe what this service offers</p>
        </div>
      </div>

      {/* Department Assignment */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-emerald-400" />
          Department Assignment
        </h3>
        
        <div className="space-y-2">
          <Label htmlFor="department" className="text-sm font-medium text-slate-300">Department</Label>
          <Select value={formData.department_id} onValueChange={(value) => handleChange('department_id', value)}>
            <SelectTrigger className="mt-1 bg-slate-700/50 border-slate-600 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-transparent">
              <SelectValue placeholder="Select department (optional)" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()} className="text-white hover:bg-slate-600 focus:bg-slate-600">
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">Choose which department this service belongs to</p>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-slate-600/30">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:text-white"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {service ? 'Update Service' : 'Add Service'}
        </Button>
      </div>
    </form>
  );
};
