import express from 'express';
import Service from '../models/Service.js';
import Department from '../models/Department.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all services (Public)
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, category, active } = req.query;
    
    const query = {};
    if (active !== undefined) query.isActive = active === 'true';
    if (department) query.department = department;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const services = await Service.find(query)
      .populate('department', 'name slug')
      .populate('relatedDoctors', 'name specialization image')
      .sort({ order: 1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get services',
      error: error.message
    });
  }
});

// @desc    Get service by ID/slug
// @route   GET /api/services/:identifier
// @access  Public
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let service;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      service = await Service.findById(identifier);
    } else {
      service = await Service.findOne({ slug: identifier });
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Populate department and related doctors
    await service.populate([
      { path: 'department', select: 'name slug description' },
      { path: 'relatedDoctors', select: 'name specialization image qualification experience' }
    ]);

    res.json({
      success: true,
      data: { service }
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service',
      error: error.message
    });
  }
});

// @desc    Get services by department
// @route   GET /api/services/department/:departmentId
// @access  Public
router.get('/department/:departmentId', async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { active = true, category } = req.query;

    const query = {
      department: departmentId,
      isActive: active === 'true'
    };

    if (category) query.category = category;

    const services = await Service.find(query)
      .populate('department', 'name slug')
      .populate('relatedDoctors', 'name specialization image')
      .sort({ order: 1, name: 1 });

    res.json({
      success: true,
      data: { services }
    });
  } catch (error) {
    console.error('Get services by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get services',
      error: error.message
    });
  }
});

// @desc    Get services by category
// @route   GET /api/services/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { active = true } = req.query;

    const services = await Service.find({
      category,
      isActive: active === 'true'
    })
      .populate('department', 'name slug')
      .populate('relatedDoctors', 'name specialization image')
      .sort({ order: 1, name: 1 });

    res.json({
      success: true,
      data: { services }
    });
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get services',
      error: error.message
    });
  }
});

// @desc    Create service
// @route   POST /api/services
// @access  Private/Admin
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Verify department exists
    const department = await Department.findById(req.body.department);
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department not found'
      });
    }

    const service = new Service(req.body);
    await service.save();

    // Populate for response
    await service.populate([
      { path: 'department', select: 'name slug' },
      { path: 'relatedDoctors', select: 'name specialization image' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message
    });
  }
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // If department is being changed, verify it exists
    if (req.body.department) {
      const department = await Department.findById(req.body.department);
      if (!department) {
        return res.status(400).json({
          success: false,
          message: 'Department not found'
        });
      }
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'department', select: 'name slug' },
      { path: 'relatedDoctors', select: 'name specialization image' }
    ]);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service }
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message
    });
  }
});

// @desc    Get service categories
// @route   GET /api/services/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Service.distinct('category', { isActive: true });
    
    // Get count for each category
    const categoryCounts = await Service.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const categoriesWithCounts = categories.map(category => {
      const countData = categoryCounts.find(c => c._id === category);
      return {
        name: category,
        count: countData ? countData.count : 0
      };
    });

    res.json({
      success: true,
      data: { categories: categoriesWithCounts }
    });
  } catch (error) {
    console.error('Get service categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service categories',
      error: error.message
    });
  }
});

// @desc    Get service statistics
// @route   GET /api/services/stats
// @access  Private/Admin
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalServices = await Service.countDocuments();
    const activeServices = await Service.countDocuments({ isActive: true });
    
    const servicesByCategory = await Service.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const servicesByDepartment = await Service.aggregate([
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
        totalServices,
        activeServices,
        inactiveServices: totalServices - activeServices,
        servicesByCategory,
        servicesByDepartment
      }
    });
  } catch (error) {
    console.error('Get service stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service statistics',
      error: error.message
    });
  }
});

export default router;