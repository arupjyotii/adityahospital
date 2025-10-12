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
          (d.description && d.description.toLowerCase().includes(search.toLowerCase()))
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

    // Validate input
    if (!departments || !Array.isArray(departments)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input: departments must be an array'
      });
    }

    const updatePromises = departments.map(dept => {
      // Validate each department object
      if (!dept.id || typeof dept.order !== 'number') {
        throw new Error('Invalid department data');
      }
      return Department.findByIdAndUpdate(dept.id, { order: dept.order });
    });

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
    
    // Check if database is connected
    if (!req.app.locals.dbConnected) {
      // Use mock data when database is not connected
      let department = mockDepartments.find(d => 
        d._id === identifier || d.slug === identifier
      );
      
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }
      
      return res.json({
        success: true,
        data: { department },
        note: 'Using mock data - database not connected'
      });
    }
    
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
  console.log('=== CREATE DEPARTMENT REQUEST ===');
  console.log('Received request body:', JSON.stringify(req.body, null, 2));
  console.log('Request body type:', typeof req.body);
  console.log('Request body keys:', Object.keys(req.body));
  
  try {
    // Validate required fields
    const { name, description } = req.body;
    
    console.log('Extracted name:', name, 'type:', typeof name);
    console.log('Extracted description:', description, 'type:', typeof description);
    
    if (!name || typeof name !== 'string' || !name.trim()) {
      console.log('Name validation failed');
      return res.status(400).json({
        success: false,
        message: 'Department name is required and must be a non-empty string'
      });
    }
    
    if (!description || typeof description !== 'string' || !description.trim()) {
      console.log('Description validation failed');
      console.log('Description value:', description);
      console.log('Description type:', typeof description);
      return res.status(400).json({
        success: false,
        message: 'Department description is required and must be a non-empty string'
      });
    }
    
    // Clean the data
    const cleanData = {
      name: name.trim(),
      description: description.trim(),
      ...req.body
    };
    
    console.log('Cleaned data:', JSON.stringify(cleanData, null, 2));
    
    // Remove any fields that might cause issues
    delete cleanData._id;
    delete cleanData.__v;
    delete cleanData.createdAt;
    delete cleanData.updatedAt;
    
    console.log('Final data to save:', JSON.stringify(cleanData, null, 2));
    
    const department = new Department(cleanData);
    console.log('Department object created:', department);
    await department.save();
    console.log('Department saved successfully');

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department }
    });
  } catch (error) {
    console.error('=== CREATE DEPARTMENT ERROR ===');
    console.error('Create department error:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error.constructor.name);
    
    // Log all properties of the error object
    console.error('Error properties:', Object.getOwnPropertyNames(error));
    for (const prop in error) {
      console.error(`Error.${prop}:`, error[prop]);
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => {
        console.error('Validation error:', err);
        return err.message;
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors,
        error: errors.join(', ')
      });
    }
    
    // More robust MongoDB duplicate key error detection
    const isDuplicateKeyError = error.code === 11000 || 
                               (error.message && error.message.includes('E11000 duplicate key error'));
    
    console.log('Is duplicate key error:', isDuplicateKeyError);
    
    if (isDuplicateKeyError) {
      console.log('Caught MongoDB duplicate key error');
      let fieldName = 'field';
      
      // Try to extract field name from error object
      if (error.keyPattern) {
        fieldName = Object.keys(error.keyPattern)[0];
      } else if (error.message) {
        // Try to extract field name from error message
        const fieldMatch = error.message.match(/index: (\w+)_\d+/);
        if (fieldMatch) {
          fieldName = fieldMatch[1];
        }
      }
      
      console.log('Field name:', fieldName);
      return res.status(409).json({
        success: false,
        message: `A department with this ${fieldName} already exists`,
        error: `Duplicate ${fieldName} error`
      });
    }
    
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
    console.log('=== UPDATE DEPARTMENT REQUEST ===');
    console.log('Received request body:', JSON.stringify(req.body, null, 2));
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', Object.keys(req.body));
    
    // Validate required fields if they are being updated
    const { name, description } = req.body;
    
    console.log('Extracted name:', name, 'type:', typeof name);
    console.log('Extracted description:', description, 'type:', typeof description);
    
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        console.log('Name validation failed for update');
        return res.status(400).json({
          success: false,
          message: 'Department name must be a non-empty string'
        });
      }
    }
    
    if (description !== undefined) {
      if (typeof description !== 'string' || !description.trim()) {
        console.log('Description validation failed for update');
        console.log('Description value:', description);
        console.log('Description type:', typeof description);
        return res.status(400).json({
          success: false,
          message: 'Department description must be a non-empty string'
        });
      }
    }
    
    // Clean the data
    const cleanData = { ...req.body };
    
    if (typeof name === 'string') {
      cleanData.name = name.trim();
    }
    
    if (typeof description === 'string') {
      cleanData.description = description.trim();
    }
    
    console.log('Cleaned update data:', JSON.stringify(cleanData, null, 2));
    
    // Remove any fields that shouldn't be updated
    delete cleanData._id;
    delete cleanData.__v;
    delete cleanData.createdAt;
    
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      cleanData,
      { new: true, runValidators: true }
    );

    if (!department) {
      console.log('Department not found for update');
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    console.log('Department updated successfully:', department);
    res.json({
      success: true,
      message: 'Department updated successfully',
      data: { department }
    });
  } catch (error) {
    console.error('=== UPDATE DEPARTMENT ERROR ===');
    console.error('Update department error:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error.constructor.name);
    
    // Log all properties of the error object
    console.error('Error properties:', Object.getOwnPropertyNames(error));
    for (const prop in error) {
      console.error(`Error.${prop}:`, error[prop]);
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => {
        console.error('Validation error:', err);
        return err.message;
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors,
        error: errors.join(', ')
      });
    }
    
    // More robust MongoDB duplicate key error detection
    const isDuplicateKeyError = error.code === 11000 || 
                               (error.message && error.message.includes('E11000 duplicate key error'));
    
    console.log('Is duplicate key error:', isDuplicateKeyError);
    
    if (isDuplicateKeyError) {
      console.log('Caught MongoDB duplicate key error');
      let fieldName = 'field';
      
      // Try to extract field name from error object
      if (error.keyPattern) {
        fieldName = Object.keys(error.keyPattern)[0];
      } else if (error.message) {
        // Try to extract field name from error message
        const fieldMatch = error.message.match(/index: (\w+)_\d+/);
        if (fieldMatch) {
          fieldName = fieldMatch[1];
        }
      }
      
      console.log('Field name:', fieldName);
      return res.status(409).json({
        success: false,
        message: `A department with this ${fieldName} already exists`,
        error: `Duplicate ${fieldName} error`
      });
    }
    
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