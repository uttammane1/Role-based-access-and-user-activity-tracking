const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuthorization');

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

// User management
router.get('/users/stats', adminController.getUserStats);
router.get('/users/active', adminController.getActiveUsers);
router.put('/users/:id/activate', adminController.activateUser);
router.put('/users/:id/deactivate', adminController.deactivateUser);

// System statistics
router.get('/stats/overview', adminController.getSystemStats);
router.get('/stats/activity', adminController.getActivityStats);

// Role management
router.get('/roles', adminController.getRoles);
router.post('/roles/:id/assign', adminController.assignRole);

module.exports = router;
