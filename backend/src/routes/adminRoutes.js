const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All admin routes require authentication and ADMIN role
router.use(requireAuth, requireRole(['ADMIN']));

// -------------------------------------------------------
// Admin Statistics
// -------------------------------------------------------
router.get('/stats', adminController.getAdminStats);

// -------------------------------------------------------
// User Management
// -------------------------------------------------------
router.get('/users', adminController.getUsers);

module.exports = router;
