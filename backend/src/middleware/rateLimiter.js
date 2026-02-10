const rateLimit = require('express-rate-limit');

/**
 * Rate limiter specifically for login attempts.
 * Prevents brute-force attacks by limiting requests per IP.
 */
const loginRateLimiter = rateLimit({
    windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // Default: 15 minutes
    max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX, 10) || 10, // Default: 10 attempts
    message: {
        success: false,
        message: 'Too many login attempts. Please try again later.',
    },
    standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,   // Disable `X-RateLimit-*` headers
});

module.exports = loginRateLimiter;
