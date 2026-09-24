const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['HELP_SEEKER', 'SERVICE_PROVIDER', 'ADMIN'],
    default: 'HELP_SEEKER'
  },
  // Location stored as GeoJSON
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  // Service Provider Specific Fields
  providerDetails: {
    serviceCategory: String,
    skills: [String],
    experience: String,
    availability: { type: Boolean, default: true },
    description: String,
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    completedRequests: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    verificationRequested: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

// Create a 2dsphere index on location
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
