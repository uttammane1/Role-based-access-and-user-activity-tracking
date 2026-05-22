const {
  getUsers,
  countUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  createLog
} = require('../dataStore');
const logger = require('../utils/logger');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status !== undefined) filter.isActive = status === 'active';

    const users = getUsers(filter);
    const total = countUsers(filter);

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const start = (pageNumber - 1) * limitNumber;
    const paged = users.slice(start, start + limitNumber);

    await createLog({
      userId: req.user._id,
      action: 'view',
      resource: 'Users',
      status: 'success'
    });

    res.json({
      total,
      page: pageNumber,
      limit: limitNumber,
      users: paged
    });
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user._id !== req.params.id && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    logger.error(`Get user by ID error: ${error.message}`);
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, department } = req.body;

    if (req.user._id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (department) updates.department = department;

    const user = await updateUser(req.params.id, updates);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await createLog({
      userId: req.user._id,
      action: 'update',
      resource: 'User',
      resourceId: req.params.id,
      changes: updates,
      status: 'success'
    });

    logger.info(`User updated: ${user.email}`);
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await deleteUser(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await createLog({
      userId: req.user._id,
      action: 'delete',
      resource: 'User',
      resourceId: req.params.id,
      status: 'success'
    });

    logger.info(`User deleted: ${user.email}`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`);
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['admin', 'manager', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await updateUser(req.params.id, { role });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await createLog({
      userId: req.user._id,
      action: 'update',
      resource: 'User',
      resourceId: req.params.id,
      changes: { role },
      status: 'success'
    });

    logger.info(`User role updated: ${user.email} -> ${role}`);
    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    logger.error(`Update user role error: ${error.message}`);
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    const user = await updateUser(req.params.id, { isActive });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await createLog({
      userId: req.user._id,
      action: 'update',
      resource: 'User',
      resourceId: req.params.id,
      changes: { isActive },
      status: 'success'
    });

    logger.info(`User status updated: ${user.email} -> ${isActive ? 'active' : 'inactive'}`);
    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    logger.error(`Update user status error: ${error.message}`);
    next(error);
  }
};
