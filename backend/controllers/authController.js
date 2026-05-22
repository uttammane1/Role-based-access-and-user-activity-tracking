const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUserByEmail, getUserById, createUser, updateUser, createLog } = require('../dataStore');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await createUser({
      name,
      email,
      password,
      role: role || 'user'
    });

    await createLog({
      userId: user._id,
      action: 'create',
      resource: 'User',
      resourceId: user._id,
      status: 'success'
    });

    const token = generateToken(user._id);

    logger.info(`User registered: ${email}`);
    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = getUserByEmail(email);
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Failed login attempt for: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is inactive' });
    }

    await updateUser(user._id, { lastLogin: new Date().toISOString() });

    await createLog({
      userId: user._id,
      action: 'login',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const token = generateToken(user._id);
    const { password: _, ...safeUser } = getUserById(user._id) || {};

    logger.info(`User logged in: ${email}`);
    res.json({
      message: 'Login successful',
      user: safeUser,
      token
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await createLog({
      userId: req.user._id,
      action: 'logout',
      status: 'success',
      ipAddress: req.ip
    });

    logger.info(`User logged out: ${req.user.email}`);
    res.json({ message: 'Logout successful' });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = getUserById(req.user._id);
    const { password: _, ...safeUser } = user || {};
    res.json(safeUser);
  } catch (error) {
    logger.error(`Get current user error: ${error.message}`);
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = getUserById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    await updateUser(req.user._id, { password: newPassword });

    logger.info(`Password changed for: ${req.user.email}`);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = getUserById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    const newToken = generateToken(user._id);
    res.json({ token: newToken });
  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`);
    res.status(401).json({ message: 'Invalid token' });
  }
};
