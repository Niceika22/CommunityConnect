const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProviderProfile, updateProfile, requestVerification } = require('../controllers/userController');

router.get('/provider/:id', protect, getProviderProfile);
router.put('/profile', protect, updateProfile);
router.post('/request-verification', protect, requestVerification);

module.exports = router;
