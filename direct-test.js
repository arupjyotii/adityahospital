// Direct test of department creation with duplicate name
import Department from './server/models/Department.js';
import mongoose from 'mongoose';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://adityahospital:Aditya%401234@cluster0.my5lehs.mongodb.net/test');
    console.log('MongoDB Connected:', conn.connection.host);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const testDuplicateDepartment = async () => {
  await connectDB();
  
  try {
    // Create a department
    const department1 = new Department({
      name: 'Test Department',
      description: 'Test Description'
    });
    
    console.log('Creating first department...');
    await department1.save();
    console.log('First department created successfully');
    
    // Try to create a duplicate
    const department2 = new Department({
      name: 'Test Department',
      description: 'Another Test Description'
    });
    
    console.log('Creating duplicate department...');
    await department2.save();
    console.log('Duplicate department created successfully');
  } catch (error) {
    console.error('Error creating department:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error.constructor.name);
    
    // Log all properties of the error object
    console.error('Error properties:', Object.getOwnPropertyNames(error));
    for (const prop in error) {
      console.error(`Error.${prop}:`, error[prop]);
    }
    
    // Test our error detection logic
    const isDuplicateKeyError = error.code === 11000 || 
                               (error.message && error.message.includes('E11000 duplicate key error'));
    
    console.log('Is duplicate key error:', isDuplicateKeyError);
    
    if (isDuplicateKeyError) {
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
      console.log('Should return 409 status with message:', `A department with this ${fieldName} already exists`);
    }
  } finally {
    await mongoose.connection.close();
  }
};

testDuplicateDepartment();