import express from 'express';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Department from '../models/Department.js';
import Service from '../models/Service.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Public
router.post('/', async (req, res) => {
  try {
    const appointmentData = req.body;

    // Verify doctor exists
    const doctor = await Doctor.findById(appointmentData.doctor);
    if (!doctor || !doctor.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Doctor not found or inactive'
      });
    }

    // Verify department exists
    const department = await Department.findById(appointmentData.department);
    if (!department || !department.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Department not found or inactive'
      });
    }

    // Verify service if provided
    if (appointmentData.service) {
      const service = await Service.findById(appointmentData.service);
      if (!service || !service.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Service not found or inactive'
        });
      }
    }

    // Check for appointment conflicts
    const conflictingAppointment = await Appointment.findOne({
      doctor: appointmentData.doctor,
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime,
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available at this time'
      });
    }

    // Set billing information
    if (doctor.consultationFee) {
      appointmentData.billing = {
        consultationFee: doctor.consultationFee,
        totalAmount: doctor.consultationFee,
        paymentStatus: 'pending'
      };
    }

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    // Populate for response
    await appointment.populate([
      { path: 'doctor', select: 'name specialization image consultationFee' },
      { path: 'department', select: 'name' },
      { path: 'service', select: 'name category' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule appointment',
      error: error.message
    });
  }
});

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private/Admin
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      doctor, 
      department, 
      status, 
      date,
      dateRange 
    } = req.query;
    
    const query = {};
    
    if (doctor) query.doctor = doctor;
    if (department) query.department = department;
    if (status) query.status = status;
    
    // Date filtering
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    } else if (dateRange) {
      const { start, end } = JSON.parse(dateRange);
      query.appointmentDate = { 
        $gte: new Date(start), 
        $lte: new Date(end) 
      };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { appointmentId: { $regex: search, $options: 'i' } },
        { 'patient.firstName': { $regex: search, $options: 'i' } },
        { 'patient.lastName': { $regex: search, $options: 'i' } },
        { 'patient.email': { $regex: search, $options: 'i' } },
        { 'patient.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization image')
      .populate('department', 'name')
      .populate('service', 'name category')
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: error.message
    });
  }
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private/Admin
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name specialization image qualification contactInfo')
      .populate('department', 'name description contactInfo')
      .populate('service', 'name category description')
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .populate('updatedBy', 'username profile.firstName profile.lastName');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: { appointment }
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment',
      error: error.message
    });
  }
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private/Admin
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updateData = { ...req.body, updatedBy: req.user.userId };

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('doctor', 'name specialization image')
      .populate('department', 'name')
      .populate('service', 'name category');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private/Admin
router.put('/:id/cancel', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        'notes.admin': reason || 'Appointment cancelled by admin',
        updatedBy: req.user.userId
      },
      { new: true }
    )
      .populate('doctor', 'name specialization')
      .populate('department', 'name');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message
    });
  }
});

// @desc    Get doctor's appointments
// @route   GET /api/appointments/doctor/:doctorId
// @access  Private/Admin
router.get('/doctor/:doctorId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, status } = req.query;

    const query = { doctor: doctorId };
    if (status) query.status = status;
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('service', 'name category')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json({
      success: true,
      data: { appointments }
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor appointments',
      error: error.message
    });
  }
});

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Private/Admin
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const totalAppointments = await Appointment.countDocuments();
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay }
    });

    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const appointmentsByDoctor = await Appointment.aggregate([
      {
        $group: {
          _id: '$doctor',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $unwind: '$doctor'
      },
      {
        $project: {
          doctorName: '$doctor.name',
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const monthlyAppointments = await Appointment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$appointmentDate' },
            month: { $month: '$appointmentDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        totalAppointments,
        todayAppointments,
        appointmentsByStatus,
        appointmentsByDoctor,
        monthlyAppointments
      }
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment statistics',
      error: error.message
    });
  }
});

export default router;