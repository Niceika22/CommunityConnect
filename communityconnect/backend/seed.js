require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const HelpRequest = require('./models/HelpRequest');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.log(err));

const seedDatabase = async () => {
  try {
    await User.deleteMany();
    await HelpRequest.deleteMany();
    
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@communityconnect.com',
      phone: '1234567890',
      password,
      role: 'ADMIN',
      location: { type: 'Point', coordinates: [77.2090, 28.6139] } // New Delhi
    });

    const seeker1 = await User.create({
      name: 'John Seeker',
      email: 'john@example.com',
      phone: '9876543210',
      password,
      role: 'HELP_SEEKER',
      location: { type: 'Point', coordinates: [77.2100, 28.6150] } // Close to provider
    });

    const provider1 = await User.create({
      name: 'Mike Provider (Plumber)',
      email: 'mike@example.com',
      phone: '9876543211',
      password,
      role: 'SERVICE_PROVIDER',
      location: { type: 'Point', coordinates: [77.2150, 28.6180] },
      providerDetails: {
        serviceCategory: 'Plumber',
        skills: ['Pipe repair', 'Installations'],
        experience: '5 years',
        rating: 4.8,
        reviewsCount: 12,
        completedRequests: 15,
        verified: true
      }
    });

    console.log('Seed data inserted successfully!');
    console.log('Admin: admin@communityconnect.com / password123');
    console.log('Seeker: john@example.com / password123');
    console.log('Provider: mike@example.com / password123');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDatabase();
