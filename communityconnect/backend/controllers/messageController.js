const Message = require('../models/Message');

exports.getMessagesByRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const messages = await Message.find({ request: requestId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Notification = require('../models/Notification');

exports.sendMessage = async (req, res) => {
  try {
    const { requestId, receiverId, content } = req.body;
    
    if (!requestId || !receiverId || !content) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const message = await Message.create({
      request: requestId,
      sender: req.user.id,
      receiver: receiverId,
      content
    });

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name');

    // Create Notification & Emit
    const io = req.app.get('io');
    if (io) {
      const notif = await Notification.create({
        user: receiverId,
        title: 'New Message',
        message: `${populatedMessage.sender.name} sent you a message`,
        type: 'NEW_MESSAGE',
        relatedId: requestId
      });
      io.to(`user:${receiverId}`).emit('new_notification', notif);
      io.to(`request_${requestId}`).emit('receive_message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
