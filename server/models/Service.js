import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['diagnostic', 'surgical', 'therapeutic', 'preventive', 'emergency', 'specialized']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 300
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  relatedDoctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }],
  image: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  procedures: [{
    name: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    duration: {
      type: String,
      trim: true
    },
    preparation: {
      type: String,
      trim: true
    }
  }],
  pricing: {
    basePrice: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    priceRange: {
      min: Number,
      max: Number
    },
    consultationRequired: {
      type: Boolean,
      default: true
    }
  },
  availability: {
    schedule: {
      type: String,
      trim: true
    },
    bookingRequired: {
      type: Boolean,
      default: true
    },
    emergencyAvailable: {
      type: Boolean,
      default: false
    }
  },
  requirements: {
    fasting: {
      type: Boolean,
      default: false
    },
    preparation: {
      type: String,
      trim: true
    },
    documents: [{
      type: String,
      trim: true
    }]
  },
  duration: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  seoData: {
    metaTitle: {
      type: String,
      trim: true
    },
    metaDescription: {
      type: String,
      trim: true
    },
    keywords: [{
      type: String,
      trim: true
    }]
  }
}, {
  timestamps: true
});

// Create slug from name before saving
serviceSchema.pre('save', function(next) {
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
serviceSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });
serviceSchema.index({ department: 1, category: 1, isActive: 1 });
serviceSchema.index({ category: 1, isActive: 1, order: 1 });
serviceSchema.index({ tags: 1, isActive: 1 });

export default mongoose.model('Service', serviceSchema);