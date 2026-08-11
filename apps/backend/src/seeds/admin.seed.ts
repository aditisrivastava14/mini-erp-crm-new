import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { UserModel } from '../models/User';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../../.env') });
// fallback local if running in backend dir
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedAdmin = async () => {
  try {
    const ADMIN_NAME = process.env.ADMIN_NAME || 'Super Admin';
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gigflow.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gigflow';

    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Database connected successfully.');

    console.log(`Checking if admin user (${ADMIN_EMAIL}) exists...`);
    const existingAdmin = await UserModel.findOne({ email: ADMIN_EMAIL, role: 'ADMIN' });

    if (existingAdmin) {
      console.log('Admin user already exists. Skipping creation.');
    } else {
      console.log('Creating admin user...');
      await UserModel.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'ADMIN',
      });
      console.log('Admin user created successfully.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  } finally {
    console.log('Closing database connection...');
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedAdmin();
