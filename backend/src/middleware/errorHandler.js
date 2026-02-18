const logger = require('../utils/logger');
const config = require('../config');

/**
 * Centralized Error Handler
 *
 * Catches all errors thrown or passed via next(error).
 * Ensures no sensitive data leaks in responses.
 * Must be registered LAST in the middleware chain.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    // Log the full error internally
    logger.error(err.message, {
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
    });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: messages,
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {}).join(', ');
        return res.status(409).json({
            success: false,
            message: `Duplicate value for: ${field}`,
        });
    }

    // Default: use the error's statusCode or fall back to 500
    const statusCode = err.statusCode || 500;
    const message =
        statusCode === 500
            ? 'Internal server error' // Never expose internal details
            : err.message;

    res.status(statusCode).json({
        success: false,
        message,
        ...(config.server.env === 'development' && statusCode === 500 && { debug: err.message, stack: err.stack }),
    });
};

module.exports = errorHandler;
