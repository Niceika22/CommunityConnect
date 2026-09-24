const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['NEW_REQUEST', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'NEW_MESSAGE', 'REQUEST_COMPLETED', 'NEW_REVIEW', 'SYSTEM'],
    default: 'SYSTEM'
  },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // Can be request ID or message ID
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
