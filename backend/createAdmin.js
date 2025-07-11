require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/client-portal')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.pan);
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminUser = new User({
      userType: 'individual',
      email: 'admin@clientportal.com',
      mobile: '9999999999',
      pan: 'ADMIN1234567',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      firstName: 'Admin',
      lastName: 'User',
      address: 'Admin Address',
      dateOfBirth: new Date('1990-01-01'),
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('PAN: ADMIN1234567');
    console.log('Password: admin123');
    console.log('Email: admin@clientportal.com');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdminUser(); 