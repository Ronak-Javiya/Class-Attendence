const express = require('express');
const router = express.Router();

const auditController = require('../controllers/auditController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All audit routes require authentication
router.use(requireAuth);

// -------------------------------------------------------
// Audit Logs
// -------------------------------------------------------

// GET /audit/logs — View audit logs (Admin/HOD only)
router.get('/logs', requireRole(['ADMIN', 'HOD']), auditController.getAuditLogs);

// GET /audit/recent — View recent audit activity (Admin/HOD only)
router.get('/recent', requireRole(['ADMIN', 'HOD']), auditController.getRecentAuditActivity);

module.exports = router;
