import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';
import Service from '../models/Service.js';

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private/Admin
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Get counts for all main entities
    const departmentsCount = await Department.countDocuments();
    const doctorsCount = await Doctor.countDocuments();
    const servicesCount = await Service.countDocuments();

    res.json({
      doctors: doctorsCount,
      departments: departmentsCount,
      services: servicesCount
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      message: 'Failed to load dashboard data',
      error: error.message
    });
  }
});

export default router;