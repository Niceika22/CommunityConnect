const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'HelpRequest', required: true, unique: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Seeker
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Provider
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
