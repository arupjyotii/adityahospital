import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, FileText } from 'lucide-react';

interface DepartmentFormProps {
  department?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({ department, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState({
    name: department?.name || '',
    description: department?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Department Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-emerald-400" />
          Department Information
        </h3>
        
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-slate-300">Department Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter department name"
            required
            className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
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
              placeholder="Brief description of the department"
              className="mt-1 pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-slate-500">Optional: Describe the department's focus or services</p>
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
          className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {department ? 'Update Department' : 'Add Department'}
        </Button>
      </div>
    </form>
  );
};
