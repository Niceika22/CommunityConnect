const User = require('../models/User');

exports.getProviderProfile = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id).select('-password');
    if (!provider || provider.role !== 'SERVICE_PROVIDER') {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    if (req.body.latitude && req.body.longitude) {
      user.location = {
        type: 'Point',
        coordinates: [Number(req.body.longitude), Number(req.body.latitude)]
      };
    }

    if (user.role === 'SERVICE_PROVIDER' && req.body.providerDetails) {
      user.providerDetails = { ...user.providerDetails, ...req.body.providerDetails };
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.requestVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'SERVICE_PROVIDER') {
      return res.status(403).json({ message: 'Only providers can request verification' });
    }

    user.providerDetails.verificationRequested = true;
    await user.save();
    
    // Find admins to notify
    const Notification = require('../models/Notification');
    const admins = await User.find({ role: 'ADMIN' });
    const io = req.app.get('io');
    
    for (const admin of admins) {
      const notif = await Notification.create({
        user: admin._id,
        title: 'Provider Verification Request',
        message: `${user.name} has requested profile verification.`,
        type: 'SYSTEM',
        relatedId: user._id
      });
      if (io) io.to(`user:${admin._id.toString()}`).emit('new_notification', notif);
    }

    res.json({ message: 'Verification requested successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
