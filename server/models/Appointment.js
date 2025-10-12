import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    required: [true, 'Appointment ID is required']
  },
  patient: {
    firstName: {
      type: String,
      required: [true, 'Patient first name is required'],
      trim: true,
      maxlength: 50,
      validate: {
        validator: function(v) {
          return v && v.trim().length > 0;
        },
        message: 'Patient first name cannot be empty'
      }
    },
    lastName: {
      type: String,
      required: [true, 'Patient last name is required'],
      trim: true,
      maxlength: 50,
      validate: {
        validator: function(v) {
          return v && v.trim().length > 0;
        },
        message: 'Patient last name cannot be empty'
      }
    },
    email: {
      type: String,
      required: [true, 'Patient email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return v && v.trim().length > 0;
        },
        message: 'Patient email cannot be empty'
      }
    },
    phone: {
      type: String,
      required: [true, 'Patient phone is required'],
      trim: true,
      validate: {
        validator: function(v) {
          return v && v.trim().length > 0;
        },
        message: 'Patient phone cannot be empty'
      }
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Patient gender is required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' }
    }
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor is required']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Appointment time cannot be empty'
    }
  },
  duration: {
    type: Number,
    default: 30, // minutes
    min: 15,
    max: 180
  },
  appointmentType: {
    type: String,
    enum: ['consultation', 'follow-up', 'procedure', 'emergency'],
    default: 'consultation'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  reason: {
    type: String,
    required: [true, 'Appointment reason is required'],
    trim: true,
    maxlength: 500,
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Appointment reason cannot be empty'
    }
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  notes: {
    patient: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    doctor: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    admin: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  medicalHistory: {
    allergies: [{
      type: String,
      trim: true
    }],
    medications: [{
      type: String,
      trim: true
    }],
    conditions: [{
      type: String,
      trim: true
    }],
    surgeries: [{
      type: String,
      trim: true
    }]
  },
  insurance: {
    provider: {
      type: String,
      trim: true
    },
    policyNumber: {
      type: String,
      trim: true
    },
    coverage: {
      type: String,
      trim: true
    }
  },
  billing: {
    consultationFee: {
      type: Number,
      min: 0
    },
    additionalCharges: [{
      description: String,
      amount: Number
    }],
    totalAmount: {
      type: Number,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online', 'insurance', 'other']
    }
  },
  reminder: {
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: {
      type: Date
    },
    method: {
      type: String,
      enum: ['email', 'sms', 'call']
    }
  },
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date
    },
    notes: {
      type: String,
      trim: true
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate appointment ID before saving
appointmentSchema.pre('save', function(next) {
  if (!this.appointmentId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.appointmentId = `APT${dateStr}${randomNum}`;
  }
  next();
});

// Indexes for better performance
appointmentSchema.index({ appointmentDate: 1, doctor: 1 });
appointmentSchema.index({ 'patient.email': 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ doctor: 1, status: 1, appointmentDate: 1 });
appointmentSchema.index({ department: 1, appointmentDate: 1 });

export default mongoose.model('Appointment', appointmentSchema);