// Test script to debug MongoDB error handling

// Simulate the MongoDB error we're getting
const error = {
  code: 11000,
  message: "E11000 duplicate key error collection: test.departments index: name_1 dup key: { name: \"Test Department\" }",
  keyPattern: { name: 1 }
};

console.log('Testing error detection:');
console.log('Error code:', error.code);
console.log('Error message:', error.message);
console.log('Key pattern:', error.keyPattern);

// Test our conditions
if (error.code === 11000) {
  console.log('✓ Direct code check works');
  const duplicateField = Object.keys(error.keyPattern)[0];
  console.log('Duplicate field:', duplicateField);
} else {
  console.log('✗ Direct code check failed');
}

if (error.message && error.message.includes('E11000 duplicate key error')) {
  console.log('✓ Message check works');
  const fieldMatch = error.message.match(/index: (\w+)_\d+/);
  const fieldName = fieldMatch ? fieldMatch[1] : 'field';
  console.log('Field from message:', fieldName);
} else {
  console.log('✗ Message check failed');
}