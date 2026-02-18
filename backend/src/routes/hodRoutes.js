const express = require('express');
const router = express.Router();

const hodController = require('../controllers/hodController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All HOD routes require authentication and HOD role
router.use(requireAuth, requireRole(['HOD']));

// -------------------------------------------------------
// HOD Statistics
// -------------------------------------------------------
router.get('/stats', hodController.getHodStats);

// -------------------------------------------------------
// Pending Approvals
// -------------------------------------------------------
router.get('/pending-approval', hodController.getPendingApprovalClasses);

module.exports = router;
