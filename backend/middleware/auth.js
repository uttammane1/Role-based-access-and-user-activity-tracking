const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { getUserById, getGuestUser } = require('../dataStore');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      req.user = getGuestUser();
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = getUserById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is inactive' });
    }

    req.user = user;
    logger.debug(`User authenticated: ${user.email}`);
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '24h' }
  );
};
