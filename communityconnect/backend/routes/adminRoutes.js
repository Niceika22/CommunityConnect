const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getStats, getAllUsers, getAllRequests, verifyProvider, deleteRequest, getUserDetails } = require('../controllers/adminController');

// All routes here protected and restricted to ADMIN
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.get('/requests', getAllRequests);
router.put('/providers/:id/verify', verifyProvider);
router.delete('/requests/:id', deleteRequest);

module.exports = router;
