import express from 'express';
import Doctor from '../models/Doctor.js';
import Department from '../models/Department.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all doctors (Public)
// @route   GET /api/doctors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, specialization, active } = req.query;
    
    const query = {};
    if (active !== undefined) query.isActive = active === 'true';
    if (department) query.department = department;
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await Doctor.find(query)
      .populate('department', 'name slug')
      .sort({ order: 1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Doctor.countDocuments(query);

    res.json({
      success: true,
      data: {
        doctors,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctors',
      error: error.message
    });
  }
});

// @desc    Get doctor by ID/slug
// @route   GET /api/doctors/:identifier
// @access  Public
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let doctor;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(identifier);
    } else {
      doctor = await Doctor.findOne({ slug: identifier });
    }

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Populate department
    await doctor.populate('department', 'name slug description');

    res.json({
      success: true,
      data: { doctor }
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor',
      error: error.message
    });
  }
});

// @desc    Get doctors by department
// @route   GET /api/doctors/department/:departmentId
// @access  Public
router.get('/department/:departmentId', async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { active = true } = req.query;

    const doctors = await Doctor.find({
      department: departmentId,
      isActive: active === 'true'
    })
      .populate('department', 'name slug')
      .sort({ order: 1, name: 1 });

    res.json({
      success: true,
      data: { doctors }
    });
  } catch (error) {
    console.error('Get doctors by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctors',
      error: error.message
    });
  }
});

// @desc    Create doctor
// @route   POST /api/doctors
// @access  Private/Admin
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Verify department exists if provided
    if (req.body.department) {
      const department = await Department.findById(req.body.department);
      if (!department) {
        return res.status(400).json({
          success: false,
          message: 'Department not found'
        });
      }
    }

    const doctor = new Doctor(req.body);
    await doctor.save();

    // Populate department for response if it exists
    if (doctor.department) {
      await doctor.populate('department', 'name slug');
    }

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: { doctor }
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create doctor',
      error: error.message
    });
  }
});

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private/Admin
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // If department is being changed, verify it exists
    if (req.body.department !== undefined) {
      if (req.body.department) {
        const department = await Department.findById(req.body.department);
        if (!department) {
          return res.status(400).json({
            success: false,
            message: 'Department not found'
          });
        }
      }
      // If department is null/empty, that's valid since it's not required
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('department', 'name slug');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      data: { doctor }
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor',
      error: error.message
    });
  }
});

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete doctor',
      error: error.message
    });
  }
});

// @desc    Update doctor availability
// @route   PUT /api/doctors/:id/availability
// @access  Private/Admin
router.put('/:id/availability', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { availability } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true, runValidators: true }
    ).populate('department', 'name slug');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor availability updated successfully',
      data: { doctor }
    });
  } catch (error) {
    console.error('Update doctor availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor availability',
      error: error.message
    });
  }
});

// @desc    Get doctor statistics
// @route   GET /api/doctors/stats
// @access  Private/Admin
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const activeDoctors = await Doctor.countDocuments({ isActive: true });
    const doctorsByDepartment = await Doctor.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $project: {
          departmentName: '$department.name',
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalDoctors,
        activeDoctors,
        inactiveDoctors: totalDoctors - activeDoctors,
        doctorsByDepartment
      }
    });
  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor statistics',
      error: error.message
    });
  }
});

export default router;