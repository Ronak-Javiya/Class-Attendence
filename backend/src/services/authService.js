const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const logger = require('../utils/logger');
const config = require('../config');

const SALT_ROUNDS = 12;

// -------------------------------------------------------
// Token Generation
// -------------------------------------------------------

/**
 * Generates a short-lived access token containing userId and role.
 */
const generateAccessToken = (user) => {
    return jwt.sign(
        { userId: user._id, role: user.role },
        config.jwt.access.secret,
        { expiresIn: config.jwt.access.expiry }
    );
};

/**
 * Generates a long-lived refresh token containing only userId.
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        { userId: user._id },
        config.jwt.refresh.secret,
        { expiresIn: config.jwt.refresh.expiry }
    );
};

// -------------------------------------------------------
// Login
// -------------------------------------------------------

/**
 * Authenticates a user by email and password.
 * Returns tokens and user info on success.
 * Throws descriptive errors on failure.
 */
const login = async (email, password) => {
    if (!email || !password) {
        const err = new Error('Email and password are required');
        err.statusCode = 400;
        throw err;
    }

    // Find user and explicitly select sensitive fields
    const user = await User.findOne({ email }).select('+passwordHash +refreshTokenHash');
    if (!user) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
    }

    // Check if user is active
    if (!user.isActive) {
        const err = new Error('Account is deactivated. Contact your administrator.');
        err.statusCode = 403;
        throw err;
    }

    // Check if Admin is approved by HoD
    if (user.role === 'ADMIN' && !user.isApproved) {
        const err = new Error('Your registration is pending HoD approval. Please wait for confirmation.');
        err.statusCode = 403;
        throw err;
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store hashed refresh token in DB (one active token per user)
    user.refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await user.save();

    logger.info('User logged in', { userId: user._id, role: user.role });

    return {
        accessToken,
        refreshToken,
        userId: user._id,
        role: user.role,
        fullName: user.fullName,
    };
};

// -------------------------------------------------------
// Refresh
// -------------------------------------------------------

/**
 * Issues a new access token using a valid refresh token.
 * Validates the token against the stored hash.
 */
const refresh = async (refreshToken) => {
    if (!refreshToken) {
        const err = new Error('Refresh token is required');
        err.statusCode = 400;
        throw err;
    }

    // Verify JWT signature and expiry
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, config.jwt.refresh.secret);
    } catch (jwtError) {
        const err = new Error('Invalid or expired refresh token');
        err.statusCode = 401;
        throw err;
    }

    // Find user and check stored hash
    const user = await User.findById(decoded.userId).select('+refreshTokenHash');
    if (!user || !user.isActive) {
        const err = new Error('User not found or deactivated');
        err.statusCode = 401;
        throw err;
    }

    if (!user.refreshTokenHash) {
        const err = new Error('No active session. Please login again.');
        err.statusCode = 401;
        throw err;
    }

    // Compare provided token against stored hash
    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
        // Potential token reuse — invalidate all sessions for safety
        user.refreshTokenHash = null;
        await user.save();
        logger.warn('Refresh token reuse detected', { userId: user._id });
        const err = new Error('Invalid refresh token. All sessions revoked.');
        err.statusCode = 401;
        throw err;
    }

    // Issue new access token (refresh token stays the same until expiry)
    const accessToken = generateAccessToken(user);

    logger.info('Access token refreshed', { userId: user._id });

    return { accessToken };
};

// -------------------------------------------------------
// Logout
// -------------------------------------------------------

/**
 * Invalidates the user's refresh token, ending their session.
 */
const logout = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    user.refreshTokenHash = null;
    await user.save();

    logger.info('User logged out', { userId: user._id });
};

module.exports = {
    login,
    refresh,
    logout,
};
