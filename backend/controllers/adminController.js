const {
  getUsers,
  getUserById,
  updateUser,
  createLog,
  countUsers,
  countTasks,
  getTaskStats,
  aggregateLogs
} = require('../dataStore');
const logger = require('../utils/logger');

exports.getUserStats = async (req, res, next) => {
  try {
    const totalUsers = countUsers();
    const activeUsers = countUsers({ isActive: true });
    const inactiveUsers = countUsers({ isActive: false });

    const roles = ['admin', 'manager', 'user'];
    const roleStats = roles.map((role) => ({
      _id: role,
      count: getUsers({ role }).length
    }));

    res.json({
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      byRole: roleStats
    });
  } catch (error) {
    logger.error(`Get user stats error: ${error.message}`);
    next(error);
  }
};

exports.getActiveUsers = async (req, res, next) => {
  try {
    const activeUsers = getUsers({ isActive: true }).sort((a, b) => {
      const aTime = a.lastLogin ? new Date(a.lastLogin) : 0;
      const bTime = b.lastLogin ? new Date(b.lastLogin) : 0;
      return bTime - aTime;
    });

    res.json(activeUsers);
  } catch (error) {
    logger.error(`Get active users error: ${error.message}`);
    next(error);
  }
};

exports.activateUser = async (req, res, next) => {
  try {
    const user = await updateUser(req.params.id, { isActive: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await createLog({
      userId: req.user._id,
      action: 'update',
      resource: 'User',
      resourceId: req.params.id,
      changes: { isActive: true },
      status: 'success'
    });

    logger.info(`User activated: ${user.email}`);
    res.json({ message: 'User activated successfully', user });
  } catch (error) {
    logger.error(`Activate user error: ${error.message}`);
    next(error);
  }
};

exports.deactivateUser = async (req, res, next) => {
  try {
    const user = await updateUser(req.params.id, { isActive: false });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await createLog({
      userId: req.user._id,
      action: 'update',
      resource: 'User',
      resourceId: req.params.id,
      changes: { isActive: false },
      status: 'success'
    });

    logger.info(`User deactivated: ${user.email}`);
    res.json({ message: 'User deactivated successfully', user });
  } catch (error) {
    logger.error(`Deactivate user error: ${error.message}`);
    next(error);
  }
};

exports.getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = countUsers();
    const totalTasks = countTasks();
    const completedTasks = getTaskStats().find((item) => item._id === 'completed')?.count || 0;
    const activeTasks = totalTasks - completedTasks;
    const taskStats = getTaskStats();

    res.json({
      users: totalUsers,
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        active: activeTasks,
        byStatus: taskStats
      }
    });
  } catch (error) {
    logger.error(`Get system stats error: ${error.message}`);
    next(error);
  }
};

exports.getActivityStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { startDate, endDate };
    const stats = aggregateLogs(filter);
    res.json(stats);
  } catch (error) {
    logger.error(`Get activity stats error: ${error.message}`);
    next(error);
  }
};

exports.getRoles = async (req, res, next) => {
  try {
    const roles = ['admin', 'manager', 'user'];
    res.json(roles);
  } catch (error) {
    logger.error(`Get roles error: ${error.message}`);
    next(error);
  }
};

exports.assignRole = async (req, res, next) => {
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

    logger.info(`Role assigned to ${user.email}: ${role}`);
    res.json({ message: 'Role assigned successfully', user });
  } catch (error) {
    logger.error(`Assign role error: ${error.message}`);
    next(error);
  }
};
