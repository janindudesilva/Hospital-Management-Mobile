import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from '../models/department.model.js';

dotenv.config();

const seedDepartments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const depts = [
      { name: 'Neurology', description: 'Brain and nervous system care', icon: 'brain-outline' },
      { name: 'Pediatrics', description: 'Medical care for infants and children', icon: 'child-outline' },
      { name: 'Orthopedics', description: 'Bones and joints specialization', icon: 'body-outline' },
      { name: 'General Medicine', description: 'Primary healthcare and diagnosis', icon: 'medical-outline' },
      { name: 'Cardiology', description: 'Heart and vascular system health', icon: 'heart-outline' }
    ];

    for (const dept of depts) {
      await Department.findOneAndUpdate(
        { name: dept.name },
        dept,
        { upsert: true, new: true }
      );
    }

    console.log('Departments seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding departments:', error);
    process.exit(1);
  }
};

seedDepartments();
