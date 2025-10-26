import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDepartments } from '@/hooks/useDepartments';
import { User, Mail, Phone, Stethoscope, Building2, Image, Clock, GraduationCap, Calendar } from 'lucide-react';

interface DoctorFormProps {
  doctor?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const DoctorForm: React.FC<DoctorFormProps> = ({ doctor, onSubmit, onCancel }) => {
  const { departments } = useDepartments();
  const [formData, setFormData] = React.useState({
    name: doctor?.name || '',
    email: doctor?.contactInfo?.email || '',
    phone: doctor?.contactInfo?.phone || '',
    specialization: doctor?.specialization || '',
    department: doctor?.department?._id || doctor?.department || '',
    qualification: doctor?.qualification || '',
    experience: doctor?.experience || 0,
    image: doctor?.image || '',
    bio: doctor?.bio || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      department: formData.department || undefined
    };
    onSubmit(submitData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-400" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-300">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter doctor's full name"
                required
                className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-300">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="doctor@hospital.com"
                  className="mt-1 pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-slate-300">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1 pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialization" className="text-sm font-medium text-slate-300">Specialization *</Label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => handleChange('specialization', e.target.value)}
                  placeholder="e.g., Cardiology, Pediatrics"
                  required
                  className="mt-1 pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-amber-400" />
            Professional Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qualification" className="text-sm font-medium text-slate-300">Qualification *</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => handleChange('qualification', e.target.value)}
                placeholder="e.g., MBBS, MD"
                required
                className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-sm font-medium text-slate-300">Years of Experience *</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                placeholder="e.g., 5"
                required
                min="0"
                max="70"
                className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium text-slate-300">Bio</Label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Doctor's biography"
              className="mt-1 w-full px-3 py-2 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent rounded-md"
              rows={4}
            />
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
            <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
              <SelectTrigger className="mt-1 bg-slate-700/50 border-slate-600 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent">
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
            <p className="text-xs text-slate-500">Assign the doctor to a specific department</p>
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Image className="h-5 w-5 mr-2 text-purple-400" />
            Additional Details
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium text-slate-300">Profile Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => handleChange('image', e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
            />
            <p className="text-xs text-slate-500">Optional: Enter a URL for the doctor's profile photo</p>
            
            {/* Photo Preview */}
            {formData.image && (
              <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                <p className="text-xs text-slate-400 mb-2">Photo Preview:</p>
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-600/30">
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
                            <div class="w-full h-full bg-red-500/20 rounded-full flex items-center justify-center">
                              <span class="text-red-400 text-xs">Invalid URL</span>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-300">Photo will appear as a circular avatar</p>
                    <p className="text-xs text-slate-400">Make sure the URL is accessible and contains a valid image</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
          >
            {doctor ? 'Update Doctor' : 'Add Doctor'}
          </Button>
        </div>
      </form>
    </div>
  );
};