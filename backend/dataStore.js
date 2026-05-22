const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const logger = require('./utils/logger');

const DATA_FILE = path.resolve(__dirname, 'data-store.json');

const store = {
  users: [],
  tasks: [],
  logs: []
};

const saveStore = async () => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (error) {
    logger.error(`Failed to save data store: ${error.message}`);
  }
};

const loadStore = async () => {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    store.users = parsed.users || [];
    store.tasks = parsed.tasks || [];
    store.logs = parsed.logs || [];
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.error(`Failed to load data store: ${error.message}`);
    }
  }
};

const ensureDefaults = async () => {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

  if (!store.users.some((user) => user.email === adminEmail)) {
    const password = await bcrypt.hash(adminPassword, 10);
    store.users.push({
      _id: crypto.randomUUID(),
      name: 'Admin',
      email: adminEmail,
      password,
      role: 'admin',
      isActive: true,
      department: 'Administration',
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  if (!store.users.some((user) => user.email === 'guest@local')) {
    const password = await bcrypt.hash('guest', 10);
    store.users.push({
      _id: crypto.randomUUID(),
      name: 'Guest User',
      email: 'guest@local',
      password,
      role: 'user',
      isActive: true,
      department: 'Guest',
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  await saveStore();
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return { ...rest };
};

const getUserById = (id) => store.users.find((user) => user._id === id) || null;
const getUserByEmail = (email) => store.users.find((user) => user.email === email.toLowerCase()) || null;
const getGuestUser = () => getUserByEmail('guest@local');

const getUsers = ({ role, isActive } = {}) => {
  return store.users.filter((user) => {
    if (role && user.role !== role) return false;
    if (typeof isActive === 'boolean' && user.isActive !== isActive) return false;
    return true;
  }).map(sanitizeUser);
};

const createUser = async ({ name, email, password, role = 'user', isActive = true, department = '' }) => {
  const hashed = await bcrypt.hash(password, 10);
  const user = {
    _id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    password: hashed,
    role,
    isActive,
    department,
    lastLogin: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.users.push(user);
  await saveStore();
  return sanitizeUser(user);
};

const updateUser = async (id, updates) => {
  const user = getUserById(id);
  if (!user) return null;

  if (updates.name !== undefined) user.name = updates.name;
  if (updates.email !== undefined) user.email = updates.email.toLowerCase();
  if (updates.department !== undefined) user.department = updates.department;
  if (updates.role !== undefined) user.role = updates.role;
  if (updates.isActive !== undefined) user.isActive = updates.isActive;
  if (updates.lastLogin !== undefined) user.lastLogin = updates.lastLogin;
  if (updates.password !== undefined) {
    user.password = await bcrypt.hash(updates.password, 10);
  }

  user.updatedAt = new Date().toISOString();
  await saveStore();
  return sanitizeUser(user);
};

const deleteUser = async (id) => {
  const index = store.users.findIndex((user) => user._id === id);
  if (index === -1) return null;
  const [deleted] = store.users.splice(index, 1);
  await saveStore();
  return sanitizeUser(deleted);
};

const getTasks = (filter = {}) => {
  return store.tasks
    .filter((task) => {
      if (filter.assignedTo && task.assignedTo !== filter.assignedTo) return false;
      if (filter.createdBy && task.createdBy !== filter.createdBy) return false;
      if (filter.status && task.status !== filter.status) return false;
      if (filter.priority && task.priority !== filter.priority) return false;
      return true;
    })
    .map((task) => ({
      ...task,
      assignedTo: sanitizeUser(getUserById(task.assignedTo)),
      createdBy: sanitizeUser(getUserById(task.createdBy))
    }));
};

const createTask = async ({ title, description, assignedTo, createdBy, status = 'pending', priority = 'medium', dueDate }) => {
  const task = {
    _id: crypto.randomUUID(),
    title,
    description,
    assignedTo,
    createdBy,
    status,
    priority,
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.tasks.push(task);
  await saveStore();
  return {
    ...task,
    assignedTo: sanitizeUser(getUserById(assignedTo)),
    createdBy: sanitizeUser(getUserById(createdBy))
  };
};

const getTaskById = (id) => {
  const task = store.tasks.find((task) => task._id === id);
  if (!task) return null;
  return {
    ...task,
    assignedTo: sanitizeUser(getUserById(task.assignedTo)),
    createdBy: sanitizeUser(getUserById(task.createdBy))
  };
};

const updateTask = async (id, updates) => {
  const task = store.tasks.find((task) => task._id === id);
  if (!task) return null;

  if (updates.title !== undefined) task.title = updates.title;
  if (updates.description !== undefined) task.description = updates.description;
  if (updates.status !== undefined) task.status = updates.status;
  if (updates.priority !== undefined) task.priority = updates.priority;
  if (updates.dueDate !== undefined) task.dueDate = updates.dueDate ? new Date(updates.dueDate).toISOString() : null;
  if (updates.assignedTo !== undefined) task.assignedTo = updates.assignedTo;
  if (updates.completedAt !== undefined) task.completedAt = updates.completedAt;

  task.updatedAt = new Date().toISOString();
  await saveStore();
  return getTaskById(id);
};

const deleteTask = async (id) => {
  const index = store.tasks.findIndex((task) => task._id === id);
  if (index === -1) return null;
  const [deleted] = store.tasks.splice(index, 1);
  await saveStore();
  return deleted;
};

const createLog = async ({ userId, action, resource, resourceId, changes, ipAddress, status = 'success', errorMessage }) => {
  const log = {
    _id: crypto.randomUUID(),
    userId,
    action,
    resource,
    resourceId,
    changes: changes || null,
    ipAddress,
    userAgent: null,
    status,
    errorMessage: errorMessage || null,
    timestamp: new Date().toISOString()
  };

  store.logs.push(log);
  await saveStore();
  return log;
};

const getLogs = (filter = {}) => {
  const logs = store.logs
    .filter((log) => {
      if (filter.userId && log.userId !== filter.userId) return false;
      if (filter.action && log.action !== filter.action) return false;
      if (filter.startDate && new Date(log.timestamp) < new Date(filter.startDate)) return false;
      if (filter.endDate && new Date(log.timestamp) > new Date(filter.endDate)) return false;
      return true;
    })
    .map((log) => ({
      ...log,
      userId: sanitizeUser(getUserById(log.userId))
    }))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return logs;
};

const countUsers = (filter = {}) => getUsers(filter).length;
const countTasks = (filter = {}) => getTasks(filter).length;
const countLogs = (filter = {}) => getLogs(filter).length;

const aggregateLogs = (filter = {}) => {
  const logs = getLogs(filter);
  const grouped = logs.reduce((acc, log) => {
    const key = log.action || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped).map(([action, count]) => ({ _id: action, count }));
};

const getTaskStats = () => {
  const byStatus = store.tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(byStatus).map(([status, count]) => ({ _id: status, count }));
};

const getActivityTrends = (days = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days, 10));
  const counts = {};

  store.logs.forEach((log) => {
    const timestamp = new Date(log.timestamp);
    if (timestamp >= startDate) {
      const day = timestamp.toISOString().split('T')[0];
      counts[day] = (counts[day] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([day, count]) => ({ _id: day, count }))
    .sort((a, b) => new Date(a._id) - new Date(b._id));
};

const init = async () => {
  await loadStore();
  await ensureDefaults();
};

module.exports = {
  store,
  getUserById,
  getUserByEmail,
  getGuestUser,
  getUsers,
  countUsers,
  createUser,
  updateUser,
  deleteUser,
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  countTasks,
  createLog,
  getLogs,
  countLogs,
  aggregateLogs,
  getTaskStats,
  getActivityTrends,
  init
};
