const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Rate limiter specifically for login attempts.
 * Prevents brute-force attacks by limiting requests per IP.
 */
const loginRateLimiter = rateLimit({
    windowMs: config.rateLimiting.login.windowMs,
    max: config.rateLimiting.login.max,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again later.',
    },
    standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,   // Disable `X-RateLimit-*` headers
});

module.exports = loginRateLimiter;
