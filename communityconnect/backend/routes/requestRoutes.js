const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createRequest,
  getNearbyProviders,
  getSeekerRequests,
  getProviderJobs,
  getNearbyRequestsForProvider,
  updateRequestStatus,
  getRequestById,
  rejectRequest
} = require('../controllers/requestController');

router.post('/', protect, authorize('HELP_SEEKER'), createRequest);
router.get('/my-requests', protect, authorize('HELP_SEEKER'), getSeekerRequests);
router.get('/provider-jobs', protect, authorize('SERVICE_PROVIDER'), getProviderJobs);
router.get('/nearby-providers', protect, authorize('HELP_SEEKER'), getNearbyProviders);
router.get('/nearby-requests', protect, authorize('SERVICE_PROVIDER'), getNearbyRequestsForProvider);
router.get('/:id', protect, getRequestById);
router.put('/:id/status', protect, updateRequestStatus);
router.put('/:id/reject', protect, authorize('SERVICE_PROVIDER'), rejectRequest);

module.exports = router;
