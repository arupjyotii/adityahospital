// Test script to verify all dependencies are correctly installed
console.log('Testing dependencies...');

const dependencies = [
  'express',
  'path-to-regexp',
  'sequelize',
  'mysql2',
  'bcryptjs',
  'jsonwebtoken',
  'cors',
  'dotenv'
];

let allGood = true;

// Use dynamic imports for ES modules
async function testDependencies() {
  for (const dep of dependencies) {
    try {
      await import(dep);
      console.log(`✅ ${dep} - OK`);
    } catch (error) {
      console.log(`❌ ${dep} - FAILED: ${error.message}`);
      allGood = false;
    }
  }

  if (allGood) {
    console.log('\n🎉 All dependencies are correctly installed!');
  } else {
    console.log('\n💥 Some dependencies are missing or incorrectly installed.');
    console.log('Run the deployment script to fix dependency issues.');
  }
}

testDependencies();