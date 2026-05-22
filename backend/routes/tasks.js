const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuthorization');

// All task routes require authentication
router.use(authenticate);

// Task CRUD operations
router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.delete('/:id', authorize('admin', 'manager'), taskController.deleteTask);

// Task status operations
router.put('/:id/status', taskController.updateTaskStatus);
router.put('/:id/assign', authorize('admin', 'manager'), taskController.reassignTask);

module.exports = router;
