import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // As per user request: username/email is 'admin' and password is 'admin123'
    const adminIdentifier = 'admin'; 
    const adminPassword = 'admin123';

    // Remove any existing admin with this email to avoid duplicates
    await User.deleteOne({ email: adminIdentifier });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await User.create({
      fullName: 'Administrator',
      email: adminIdentifier,
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    console.log('Admin account created successfully!');
    console.log('Username: ' + adminIdentifier);
    console.log('Password: ' + adminPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
