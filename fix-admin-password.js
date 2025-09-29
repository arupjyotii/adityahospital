import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const fixAdminPassword = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find the admin user
    const adminUser = await User.findOne({ username: 'admin' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('User found:', adminUser.username);
    console.log('Current password (plain text):', adminUser.password);
    
    // Force mark password as modified to ensure the pre-save hook runs
    const plainPassword = 'admin123';
    adminUser.password = plainPassword;
    adminUser.markModified('password');
    
    // Save the user (this will trigger the pre-save hook to hash the password)
    await adminUser.save();
    
    console.log('✅ Admin password updated and will be hashed by pre-save hook');
    console.log('   Username: admin');
    console.log('   Password: admin123 (will be hashed)');
    
    // Reload the user to see the hashed password
    const updatedUser = await User.findById(adminUser._id);
    console.log('Hashed password:', updatedUser.password);
    
    // Test the new password
    const isMatch = await updatedUser.comparePassword(plainPassword);
    console.log('Password verification test:', isMatch ? 'PASSED' : 'FAILED');
    
  } catch (error) {
    console.error('❌ Error fixing password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the fix function
fixAdminPassword();