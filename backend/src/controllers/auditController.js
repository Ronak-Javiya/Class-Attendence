const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

/**
 * GET /audit/logs
 * Returns paginated audit logs with filters.
 */
const getAuditLogs = async (req, res, next) => {
    try {
        const { action, entityType, userId, page = 1, limit = 50 } = req.query;
        
        const query = {};
        if (action) query.action = action;
        if (entityType) query.entityType = entityType;
        if (userId) query.performedBy = userId;

        const logs = await AuditLog.find(query)
            .populate('performedBy', 'fullName email role')
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(query);

        res.status(200).json({
            success: true,
            data: { logs, total, page: parseInt(page), pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /audit/recent
 * Returns recent audit activity (last 20 entries).
 */
const getRecentAuditActivity = async (req, res, next) => {
    try {
        const logs = await AuditLog.find()
            .populate('performedBy', 'fullName email role')
            .sort({ timestamp: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            data: logs,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create audit log entry (internal use).
 */
const createAuditLog = async (data) => {
    const log = new AuditLog(data);
    await log.save();
    return log;
};

module.exports = {
    getAuditLogs,
    getRecentAuditActivity,
    createAuditLog,
};
