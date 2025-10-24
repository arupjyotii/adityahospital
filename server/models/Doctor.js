import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: false
  },
  qualification: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  experience: {
    type: Number,
    required: true,
    min: 0,
    max: 70
  },
  image: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  expertise: [{
    type: String,
    trim: true
  }],
  education: [{
    degree: {
      type: String,
      trim: true
    },
    institution: {
      type: String,
      trim: true
    },
    year: {
      type: Number
    }
  }],
  awards: [{
    title: {
      type: String,
      trim: true
    },
    year: {
      type: Number
    },
    description: {
      type: String,
      trim: true
    }
  }],
  contactInfo: {
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    clinic: {
      type: String,
      trim: true
    }
  },
  availability: {
    monday: { start: String, end: String, available: { type: Boolean, default: true } },
    tuesday: { start: String, end: String, available: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, available: { type: Boolean, default: true } },
    thursday: { start: String, end: String, available: { type: Boolean, default: true } },
    friday: { start: String, end: String, available: { type: Boolean, default: true } },
    saturday: { start: String, end: String, available: { type: Boolean, default: true } },
    sunday: { start: String, end: String, available: { type: Boolean, default: false } }
  },
  consultationFee: {
    type: Number,
    min: 0
  },
  languages: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  isHeadOfDepartment: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Create slug from name before saving
doctorSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    let slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .trim('-');
    
    // Add timestamp to make slug more unique
    slug += '-' + Date.now();
    
    this.slug = slug;
  }
  
  // Handle department field - set to undefined if null to avoid validation issues
  if (this.department === null) {
    this.department = undefined;
  }
  
  next();
});

// Also handle department field in updates
doctorSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.department === null) {
    update.department = undefined;
  }
  next();
});

// Index for better search performance
doctorSchema.index({ name: 'text', specialization: 'text', bio: 'text' });
doctorSchema.index({ department: 1, isActive: 1, order: 1 });
doctorSchema.index({ specialization: 1, isActive: 1 });

export default mongoose.model('Doctor', doctorSchema);