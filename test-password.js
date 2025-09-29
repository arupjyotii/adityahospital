import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const testPassword = async () => {
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
    console.log('Password hash:', adminUser.password);
    
    // Test password comparison
    const testPassword = 'admin123';
    const isMatch = await adminUser.comparePassword(testPassword);
    console.log('Password match:', isMatch);
    
    // Test bcrypt directly
    const isMatchBcrypt = await bcrypt.compare(testPassword, adminUser.password);
    console.log('Bcrypt comparison result:', isMatchBcrypt);
    
  } catch (error) {
    console.error('❌ Error testing password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the test function
testPassword();