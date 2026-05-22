const {
  getLogs,
  createLog,
  countLogs,
  aggregateLogs,
  getActivityTrends
} = require('../dataStore');
const logger = require('../utils/logger');

exports.getAllLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const logs = getLogs();
    const total = logs.length;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const start = (pageNumber - 1) * limitNumber;

    res.json({
      total,
      page: pageNumber,
      limit: limitNumber,
      logs: logs.slice(start, start + limitNumber)
    });
  } catch (error) {
    logger.error(`Get all logs error: ${error.message}`);
    next(error);
  }
};

exports.getUserLogs = async (req, res, next) => {
  try {
    let { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (userId === 'me') {
      userId = req.user._id;
    }

    if (req.user.role === 'user' && req.user._id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const logs = getLogs({ userId });
    const total = logs.length;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const start = (pageNumber - 1) * limitNumber;

    res.json({
      total,
      page: pageNumber,
      limit: limitNumber,
      logs: logs.slice(start, start + limitNumber)
    });
  } catch (error) {
    logger.error(`Get user logs error: ${error.message}`);
    next(error);
  }
};

exports.getLogsByAction = async (req, res, next) => {
  try {
    const { action } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const logs = getLogs({ action });
    const total = logs.length;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const start = (pageNumber - 1) * limitNumber;

    res.json({
      total,
      page: pageNumber,
      limit: limitNumber,
      logs: logs.slice(start, start + limitNumber)
    });
  } catch (error) {
    logger.error(`Get logs by action error: ${error.message}`);
    next(error);
  }
};

exports.getLogsByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const logs = getLogs({ startDate, endDate });
    const total = logs.length;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const start = (pageNumber - 1) * limitNumber;

    res.json({
      total,
      page: pageNumber,
      limit: limitNumber,
      startDate,
      endDate,
      logs: logs.slice(start, start + limitNumber)
    });
  } catch (error) {
    logger.error(`Get logs by date range error: ${error.message}`);
    next(error);
  }
};

exports.createLog = async (req, res, next) => {
  try {
    const { userId, action, resource, resourceId, changes, ipAddress, status, errorMessage } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ message: 'userId and action are required' });
    }

    const log = await createLog({
      userId,
      action,
      resource,
      resourceId,
      changes,
      ipAddress: ipAddress || req.ip,
      status: status || 'success',
      errorMessage
    });

    res.status(201).json({ message: 'Log created', log });
  } catch (error) {
    logger.error(`Create log error: ${error.message}`);
    next(error);
  }
};

exports.getActivitySummary = async (req, res, next) => {
  try {
    const summary = aggregateLogs(req.query);
    res.json(summary);
  } catch (error) {
    logger.error(`Get activity summary error: ${error.message}`);
    next(error);
  }
};

exports.getActivityTrends = async (req, res, next) => {
  try {
    const days = req.query.days || 7;
    const trends = getActivityTrends(days);

    res.json({
      days: parseInt(days, 10),
      trends
    });
  } catch (error) {
    logger.error(`Get activity trends error: ${error.message}`);
    next(error);
  }
};
