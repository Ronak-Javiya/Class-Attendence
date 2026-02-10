const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware — requireAuth
 *
 * Verifies the JWT access token from the Authorization header.
 * Attaches the authenticated user object to `req.user`.
 * Blocks by default — no token means no access.
 */
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token signature and expiry
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // Fetch user to ensure they still exist and are active
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User associated with this token no longer exists.',
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated.',
            });
        }

        // Attach user info to request for downstream use
        req.user = {
            userId: user._id,
            role: user.role,
            fullName: user.fullName,
            email: user.email,
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please refresh your session.',
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.',
            });
        }
        next(error);
    }
};

module.exports = requireAuth;
