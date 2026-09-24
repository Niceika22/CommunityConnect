require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for admin creation'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

const createAdmin = async () => {
  try {
    const email = 'admin@communityconnect.com';
    const passwordRaw = 'Admin@12345';
    
    // Hash password using the same logic the app uses
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordRaw, salt);

    let admin = await User.findOne({ email });

    if (admin) {
      admin.name = 'CommunityConnect Admin';
      admin.phone = '9999999999';
      admin.password = hashedPassword;
      admin.role = 'ADMIN';
      await admin.save();
      console.log('Admin user updated successfully.');
    } else {
      admin = await User.create({
        name: 'CommunityConnect Admin',
        email,
        phone: '9999999999',
        password: hashedPassword,
        role: 'ADMIN',
        location: { type: 'Point', coordinates: [0, 0] }
      });
      console.log('Admin user created successfully.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
