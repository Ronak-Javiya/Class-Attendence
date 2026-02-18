const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All report routes require authentication and ADMIN role
router.use(requireAuth, requireRole(['ADMIN']));

// -------------------------------------------------------
// Reports
// -------------------------------------------------------

// GET /reports — List available reports
router.get('/', reportController.getReportsList);

// POST /reports/generate — Generate a report
router.post('/generate', reportController.generateReport);

module.exports = router;
