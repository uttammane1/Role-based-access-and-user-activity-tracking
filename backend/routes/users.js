const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuthorization');

// All user routes require authentication
router.use(authenticate);

// User operations
router.get('/', authorize('admin', 'manager'), userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

// Role management
router.put('/:id/role', authorize('admin'), userController.updateUserRole);
router.put('/:id/status', authorize('admin'), userController.updateUserStatus);

module.exports = router;
