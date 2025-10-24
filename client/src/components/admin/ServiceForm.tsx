import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDepartments } from '@/hooks/useDepartments';
import { Briefcase, FileText, Building2, Tag } from 'lucide-react';

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
    shortDescription: service?.shortDescription || '',
    department: service?.department?._id || service?.department || '',
    category: service?.category || 'diagnostic', // Added required field with default
    image: service?.image || '' // Added field
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      department: formData.department || null
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
          <Label htmlFor="shortDescription" className="text-sm font-medium text-slate-300">Short Description</Label>
          <Input
            id="shortDescription"
            value={formData.shortDescription}
            onChange={(e) => handleChange('shortDescription', e.target.value)}
            placeholder="Brief description of the service"
            className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-slate-300">Detailed Description *</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed description of the service"
              required
              className="mt-1 pl-10 w-full px-3 py-2 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent rounded-md"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Category and Department */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Tag className="h-5 w-5 mr-2 text-amber-400" />
          Category & Department
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-slate-300">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger className="mt-1 bg-slate-700/50 border-slate-600 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-transparent">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="diagnostic" className="text-white hover:bg-slate-600 focus:bg-slate-600">
                  Diagnostic
                </SelectItem>
                <SelectItem value="surgical" className="text-white hover:bg-slate-600 focus:bg-slate-600">
                  Surgical
                </SelectItem>
                <SelectItem value="therapeutic" className="text-white hover:bg-slate-600 focus:bg-slate-600">
                  Therapeutic
                </SelectItem>
                <SelectItem value="preventive" className="text-white hover:bg-slate-600 focus:bg-slate-600">
                  Preventive
                </SelectItem>
                <SelectItem value="emergency" className="text-white hover:bg-slate-600 focus:bg-slate-600">
                  Emergency
                </SelectItem>
                <SelectItem value="specialized" className="text-white hover:bg-slate-600 focus:bg-slate-600">
                  Specialized
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium text-slate-300">Department</Label>
            <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
              <SelectTrigger className="mt-1 bg-slate-700/50 border-slate-600 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-transparent">
                <SelectValue placeholder="Select department (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {departments?.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id} className="text-white hover:bg-slate-600 focus:bg-slate-600">
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">Choose which department this service belongs to</p>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-emerald-400" />
          Additional Details
        </h3>
        
        <div className="space-y-2">
          <Label htmlFor="image" className="text-sm font-medium text-slate-300">Service Image URL</Label>
          <Input
            id="image"
            value={formData.image}
            onChange={(e) => handleChange('image', e.target.value)}
            placeholder="https://example.com/service-image.jpg"
            className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
          />
          <p className="text-xs text-slate-500">Optional: Enter a URL for the service image</p>
          
          {/* Image Preview */}
          {formData.image && (
            <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-400 mb-2">Image Preview:</p>
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 rounded overflow-hidden border-2 border-slate-600/30">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full bg-red-500/20 rounded flex items-center justify-center">
                            <span class="text-red-400 text-xs">Invalid URL</span>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-300">Service image preview</p>
                  <p className="text-xs text-slate-400">Make sure the URL is accessible and contains a valid image</p>
                </div>
              </div>
            </div>
          )}
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