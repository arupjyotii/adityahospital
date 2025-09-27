import express from 'express';
import Department from '../models/Department.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { mockDepartments } from '../utils/mockData.js';

const router = express.Router();

// @desc    Get all departments (Public)
// @route   GET /api/departments
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Check if database is connected
    if (!req.app.locals.dbConnected) {
      // Use mock data when database is not connected
      const { page = 1, limit = 10, search, active } = req.query;
      let departments = [...mockDepartments];
      
      // Apply filters
      if (active !== undefined) {
        departments = departments.filter(d => d.isActive === (active === 'true'));
      }
      if (search) {
        departments = departments.filter(d => 
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedDepartments = departments.slice(startIndex, endIndex);
      
      return res.json({
        success: true,
        data: {
          departments: paginatedDepartments,
          pagination: {
            current: Number(page),
            pages: Math.ceil(departments.length / limit),
            total: departments.length
          }
        },
        note: 'Using mock data - database not connected'
      });
    }

    const { page = 1, limit = 10, search, active } = req.query;
    
    const query = {};
    if (active !== undefined) query.isActive = active === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const departments = await Department.find(query)
      .populate('headOfDepartment', 'name specialization image')
      .sort({ order: 1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Department.countDocuments(query);

    res.json({
      success: true,
      data: {
        departments,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get departments',
      error: error.message
    });
  }
});

// @desc    Update department order (must be before /:identifier route)
// @route   PUT /api/departments/reorder
// @access  Private/Admin
router.put('/reorder', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { departments } = req.body; // Array of { id, order }

    const updatePromises = departments.map(dept =>
      Department.findByIdAndUpdate(dept.id, { order: dept.order })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Department order updated successfully'
    });
  } catch (error) {
    console.error('Reorder departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder departments',
      error: error.message
    });
  }
});

// @desc    Get department by ID/slug
// @route   GET /api/departments/:identifier
// @access  Public
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let department;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      department = await Department.findById(identifier);
    } else {
      department = await Department.findOne({ slug: identifier });
    }

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Populate head of department
    await department.populate('headOfDepartment', 'name specialization image qualification experience');

    res.json({
      success: true,
      data: { department }
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get department',
      error: error.message
    });
  }
});

// @desc    Create department
// @route   POST /api/departments
// @access  Private/Admin
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department }
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create department',
      error: error.message
    });
  }
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: { department }
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update department',
      error: error.message
    });
  }
});

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete department',
      error: error.message
    });
  }
});

export default router;