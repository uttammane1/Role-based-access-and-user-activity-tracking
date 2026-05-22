const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuthorization');

// All activity log routes require authentication
router.use(authenticate);

// Activity log operations
router.get('/', authorize('admin', 'manager'), activityLogController.getAllLogs);
router.get('/user/:userId', activityLogController.getUserLogs);
router.get('/action/:action', authorize('admin', 'manager'), activityLogController.getLogsByAction);
router.get('/date-range', authorize('admin', 'manager'), activityLogController.getLogsByDateRange);

// Log creation (internal use)
router.post('/', activityLogController.createLog);

// Analytics
router.get('/analytics/summary', authorize('admin', 'manager'), activityLogController.getActivitySummary);
router.get('/analytics/trends', authorize('admin'), activityLogController.getActivityTrends);

module.exports = router;
