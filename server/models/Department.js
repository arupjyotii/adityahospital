import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
    maxlength: 100,
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Department name cannot be empty'
    }
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Department description is required'],
    trim: true,
    maxlength: 1000,
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Department description cannot be empty'
    }
  },
  image: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  services: [{
    type: String,
    trim: true
  }],
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    location: {
      type: String,
      trim: true
    }
  },
  operatingHours: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String }
  },
  emergencyAvailable: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create slug from name before saving
departmentSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .trim('-');
  }
  next();
});

// Index for better search performance
departmentSchema.index({ name: 'text', description: 'text' });
departmentSchema.index({ isActive: 1, order: 1 });

export default mongoose.model('Department', departmentSchema);