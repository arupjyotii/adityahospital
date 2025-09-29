import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';

// Load environment variables
dotenv.config();

const resetAdminPassword = async () => {
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

    // Update the password
    const newPassword = 'admin123';
    adminUser.password = newPassword;
    await adminUser.save();
    
    console.log('✅ Admin password reset successfully');
    console.log('   Username: admin');
    console.log('   New Password: admin123');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the reset function
resetAdminPassword();