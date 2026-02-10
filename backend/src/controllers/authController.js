const authService = require('../services/authService');

/**
 * Auth Controller — thin layer delegating to authService.
 * Handles HTTP concerns (request parsing, response formatting) only.
 */

/**
 * POST /auth/login
 * Authenticates a user and returns tokens.
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /auth/refresh
 * Issues a new access token using a valid refresh token.
 */
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refresh(refreshToken);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /auth/logout
 * Invalidates the user's refresh token.
 * Requires authentication (user must be logged in).
 */
const logout = async (req, res, next) => {
    try {
        await authService.logout(req.user.userId);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /auth/me
 * Returns the currently authenticated user's profile.
 * Useful for frontend session checks.
 */
const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            userId: req.user.userId,
            fullName: req.user.fullName,
            email: req.user.email,
            role: req.user.role,
        },
    });
};

module.exports = {
    login,
    refreshToken,
    logout,
    getMe,
};
