const logger = require('../utils/logger');

// Define role-based permissions
const permissions = {
  admin: ['create', 'read', 'update', 'delete', 'manage_users', 'view_logs'],
  manager: ['create', 'read', 'update', 'delete', 'view_logs'],
  user: ['create', 'read', 'update']
};

exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by ${req.user.email} with role ${req.user.role}`);
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    logger.debug(`Authorization successful for ${req.user.email}`);
    next();
  };
};

exports.checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userPermissions = permissions[req.user.role] || [];

    if (!userPermissions.includes(requiredPermission)) {
      logger.warn(`Permission denied for ${req.user.email}: ${requiredPermission}`);
      return res.status(403).json({ 
        message: `Permission denied: ${requiredPermission}` 
      });
    }

    next();
  };
};

exports.getPermissions = (role) => {
  return permissions[role] || [];
};
