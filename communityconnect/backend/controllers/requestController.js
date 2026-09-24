const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');

exports.createRequest = async (req, res) => {
  try {
    const { title, category, description, urgency, latitude, longitude, preferredTime, additionalNotes } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Location is required' });
    }

    const helpRequest = await HelpRequest.create({
      seeker: req.user.id,
      title,
      category,
      description,
      urgency,
      preferredTime,
      additionalNotes,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)]
      }
    });
    
    // Populate seeker for the socket event
    await helpRequest.populate('seeker', 'name');

    res.status(201).json(helpRequest);

    // After response, emit to nearby providers
    const io = req.app.get('io');
    if (io) {
      const providers = await User.find({
        role: 'SERVICE_PROVIDER',
        'providerDetails.serviceCategory': category,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [Number(longitude), Number(latitude)]
            },
            $maxDistance: 15000 // 15km
          }
        }
      });
      
      providers.forEach(p => {
        io.to(`user:${p._id.toString()}`).emit('new_nearby_request', helpRequest);
      });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNearbyProviders = async (req, res) => {
  try {
    const { latitude, longitude, category, maxDistance = 10000 } = req.query; // maxDistance in meters (10km default)
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Coordinates are required' });
    }

    const query = {
      role: 'SERVICE_PROVIDER',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: Number(maxDistance)
        }
      }
    };

    if (category) {
      query['providerDetails.serviceCategory'] = category;
    }

    const providers = await User.find(query).select('-password');
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSeekerRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find({ seeker: req.user.id }).populate('provider', 'name phone providerDetails');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProviderJobs = async (req, res) => {
  try {
    const requests = await HelpRequest.find({ provider: req.user.id }).populate('seeker', 'name phone email');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNearbyRequestsForProvider = async (req, res) => {
  try {
    // Provider's location should be passed or fetched from req.user
    const provider = await User.findById(req.user.id);
    
    if (!provider || !provider.location || !provider.location.coordinates || provider.location.coordinates.length < 2) {
      return res.status(400).json({ message: 'Your location is required to find nearby requests. Please update your profile with your location.' });
    }

    const coords = provider.location.coordinates; // [lng, lat]

    if (coords[0] === 0 && coords[1] === 0) {
      return res.status(400).json({ message: 'Provider location not set properly' });
    }

    const requests = await HelpRequest.find({
      status: 'PENDING',
      rejectedBy: { $ne: req.user.id },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coords
          },
          $maxDistance: 15000 // 15km
        }
      }
    }).populate('seeker', 'name');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'SERVICE_PROVIDER') {
      return res.status(403).json({ message: 'Only providers can reject requests' });
    }

    const request = await HelpRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (!request.rejectedBy.includes(req.user.id)) {
      request.rejectedBy.push(req.user.id);
      await request.save();
    }

    res.json({ message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Notification = require('../models/Notification');

exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await HelpRequest.findById(id).populate('seeker').populate('provider');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (status === 'ACCEPTED' && req.user.role === 'SERVICE_PROVIDER') {
      request.provider = req.user.id;
    }
    
    request.status = status;
    request.updatedAt = Date.now();
    await request.save();

    // Re-populate if provider was just assigned
    const updatedRequest = await HelpRequest.findById(id)
      .populate('seeker', 'name')
      .populate('provider', 'name');

    // Create Notification & Emit
    const io = req.app.get('io');
    if (io) {
      if (status === 'ACCEPTED') {
        const notif = await Notification.create({
          user: updatedRequest.seeker._id,
          title: 'Request Accepted!',
          message: `${updatedRequest.provider.name} accepted your request: ${updatedRequest.title}`,
          type: 'REQUEST_ACCEPTED',
          relatedId: updatedRequest._id
        });
        io.to(`user:${updatedRequest.seeker._id.toString()}`).emit('new_notification', notif);
        io.to(`user:${updatedRequest.seeker._id.toString()}`).emit('request_updated', updatedRequest);
      } else if (status === 'COMPLETED') {
         const notif = await Notification.create({
          user: updatedRequest.seeker._id,
          title: 'Request Completed',
          message: `Your request "${updatedRequest.title}" was marked as completed.`,
          type: 'REQUEST_COMPLETED',
          relatedId: updatedRequest._id
        });
        io.to(`user:${updatedRequest.seeker._id.toString()}`).emit('new_notification', notif);
        io.to(`user:${updatedRequest.seeker._id.toString()}`).emit('request_updated', updatedRequest);
      }
    }

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id)
      .populate('seeker', 'name phone email')
      .populate('provider', 'name phone providerDetails');
    
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
