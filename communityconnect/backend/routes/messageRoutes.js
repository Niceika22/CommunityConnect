const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMessagesByRequest, sendMessage } = require('../controllers/messageController');

router.get('/:requestId', protect, getMessagesByRequest);
router.post('/', protect, sendMessage);

module.exports = router;
