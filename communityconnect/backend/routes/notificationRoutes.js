const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUserNotifications, markAsRead, markAllAsRead, getUnreadCount } = require('../controllers/notificationController');

router.use(protect);

router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;
