const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const requireAuth = require('../middleware/authMiddleware');
const loginRateLimiter = require('../middleware/rateLimiter');

// -------------------------------------------------------
// Public Routes (no auth required)
// -------------------------------------------------------

// POST /auth/login — Authenticate user, return tokens
router.post('/login', loginRateLimiter, authController.login);

// POST /auth/refresh — Get new access token using refresh token
router.post('/refresh', authController.refreshToken);

// -------------------------------------------------------
// Protected Routes (auth required)
// -------------------------------------------------------

// POST /auth/logout — Invalidate refresh token
router.post('/logout', requireAuth, authController.logout);

// GET /auth/me — Get current user profile
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
