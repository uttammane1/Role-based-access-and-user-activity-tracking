const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getUserById,
  createLog
} = require('../dataStore');
const logger = require('../utils/logger');

exports.getTasks = async (req, res, next) => {
  try {
    const { status, assignedTo, createdBy, priority, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (req.user.role !== 'user') {
      if (assignedTo) filter.assignedTo = assignedTo;
      if (createdBy) filter.createdBy = createdBy;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    let tasks = getTasks(filter);
    if (req.user.role === 'user') {
      tasks = tasks.filter((task) => {
        const assigneeId = task.assignedTo?._id || '';
        const creatorId = task.createdBy?._id || '';
        return assigneeId === req.user._id || creatorId === req.user._id;
      });
    }

    const total = tasks.length;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const start = (pageNumber - 1) * limitNumber;
    const paged = tasks.slice(start, start + limitNumber);

    res.json({
      total,
      page: pageNumber,
      limit: limitNumber,
      tasks: paged
    });
  } catch (error) {
    logger.error(`Get tasks error: ${error.message}`);
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, status, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const targetAssignee = assignedTo === 'me' || !assignedTo ? req.user._id : assignedTo;
    const assignedUser = getUserById(targetAssignee);
    if (!assignedUser) {
      return res.status(400).json({ message: 'Assigned user not found' });
    }

    const task = await createTask({
      title,
      description,
      assignedTo: targetAssignee,
      createdBy: req.user._id,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate
    });

    await createLog({
      userId: req.user._id,
      action: 'create',
      resource: 'Task',
      resourceId: task._id,
      status: 'success'
    });

    logger.info(`Task created: ${task._id}`);
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    logger.error(`Create task error: ${error.message}`);
    next(error);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const task = getTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'user' && req.user._id !== task.assignedTo._id && req.user._id !== task.createdBy._id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    logger.error(`Get task error: ${error.message}`);
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'user' && req.user._id !== task.createdBy._id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;

    const updatedTask = await updateTask(req.params.id, updates);

    await createLog({
      userId: req.user._id,
      action: 'update',
      resource: 'Task',
      resourceId: req.params.id,
      changes: updates,
      status: 'success'
    });

    logger.info(`Task updated: ${req.params.id}`);
    res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    logger.error(`Update task error: ${error.message}`);
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await deleteTask(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await createLog({
      userId: req.user._id,
      action: 'delete',
      resource: 'Task',
      resourceId: req.params.id,
      status: 'success'
    });

    logger.info(`Task deleted: ${req.params.id}`);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    logger.error(`Delete task error: ${error.message}`);
    next(error);
  }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'user' && req.user._id !== task.assignedTo._id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = { status };
    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }

    const updatedTask = await updateTask(req.params.id, updates);

    await createLog({
      userId: req.user._id,
      action: 'update',
      resource: 'Task',
      resourceId: req.params.id,
      changes: { status },
      status: 'success'
    });

    logger.info(`Task status updated: ${req.params.id} -> ${status}`);
    res.json({ message: 'Task status updated successfully', task: updatedTask });
  } catch (error) {
    logger.error(`Update task status error: ${error.message}`);
    next(error);
  }
};

exports.reassignTask = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ message: 'assignedTo is required' });
    }

    const assignedUser = getUserById(assignedTo);
    if (!assignedUser) {
      return res.status(400).json({ message: 'Assigned user not found' });
    }

    const task = getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = await updateTask(req.params.id, { assignedTo });

    await createLog({
      userId: req.user._id,
      action: 'update',
      resource: 'Task',
      resourceId: req.params.id,
      changes: { assignedTo },
      status: 'success'
    });

    logger.info(`Task reassigned: ${req.params.id}`);
    res.json({ message: 'Task reassigned successfully', task: updatedTask });
  } catch (error) {
    logger.error(`Reassign task error: ${error.message}`);
    next(error);
  }
};
