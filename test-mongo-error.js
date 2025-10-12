// Test script to simulate MongoDB duplicate key error handling
import Department from './server/models/Department.js';

// Simulate the error we're getting
const simulateError = () => {
  const error = new Error("E11000 duplicate key error collection: test.departments index: name_1 dup key: { name: \"Test Department\" }");
  error.code = 11000;
  error.keyPattern = { name: 1 };
  
  console.log('Simulating MongoDB error:');
  console.log('Error:', error);
  console.log('Error code:', error.code);
  console.log('Error message:', error.message);
  console.log('Key pattern:', error.keyPattern);
  
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
};

simulateError();