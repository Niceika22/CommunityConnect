const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'HelpRequest' },
  reason: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['PENDING', 'REVIEWED', 'RESOLVED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
