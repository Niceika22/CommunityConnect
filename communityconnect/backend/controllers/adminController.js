const User = require('../models/User');
const HelpRequest = require('../models/HelpRequest');
const Report = require('../models/Report');

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const providers = await User.countDocuments({ role: 'SERVICE_PROVIDER' });
    const seekers = await User.countDocuments({ role: 'HELP_SEEKER' });
    
    const activeRequests = await HelpRequest.countDocuments({ status: { $in: ['ACCEPTED', 'IN_PROGRESS'] } });
    const completedRequests = await HelpRequest.countDocuments({ status: 'COMPLETED' });
    const pendingRequests = await HelpRequest.countDocuments({ status: 'PENDING' });
    const emergencyRequests = await HelpRequest.countDocuments({ urgency: 'EMERGENCY' });

    const reportsCount = await Report.countDocuments();

    res.json({
      totalUsers,
      providers,
      seekers,
      activeRequests,
      completedRequests,
      pendingRequests,
      emergencyRequests,
      reportsCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find()
      .populate('seeker', 'name')
      .populate('provider', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Notification = require('../models/Notification');

exports.verifyProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await User.findById(id);
    if (provider && provider.role === 'SERVICE_PROVIDER') {
      provider.providerDetails.verified = true;
      await provider.save();
      
      const io = req.app.get('io');
      if (io) {
         const notif = await Notification.create({
            user: provider._id,
            title: 'Account Verified!',
            message: 'Your service provider account has been verified by the admin.',
            type: 'SYSTEM'
         });
         io.to(`user:${provider._id.toString()}`).emit('new_notification', notif);
      }

      res.json(provider);
    } else {
      res.status(404).json({ message: 'Provider not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    await HelpRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let stats = {};
    if (user.role === 'HELP_SEEKER') {
      stats.requestsCreated = await HelpRequest.countDocuments({ seeker: user._id });
      stats.requestsCompleted = await HelpRequest.countDocuments({ seeker: user._id, status: 'COMPLETED' });
    } else if (user.role === 'SERVICE_PROVIDER') {
      stats.jobsAssigned = await HelpRequest.countDocuments({ provider: user._id });
      stats.jobsCompleted = await HelpRequest.countDocuments({ provider: user._id, status: 'COMPLETED' });
    }

    res.json({ user, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
