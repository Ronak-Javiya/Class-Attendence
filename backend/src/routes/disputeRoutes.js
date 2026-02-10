const express = require('express');
const router = express.Router();

const disputeController = require('../controllers/disputeController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(requireAuth);

// -------------------------------------------------------
// Student APIs
// -------------------------------------------------------

// POST /disputes — Raise a dispute
router.post('/', requireRole(['STUDENT']), disputeController.raiseDispute);

// GET /disputes/my — View my disputes
router.get('/my', requireRole(['STUDENT']), disputeController.getMyDisputes);

// GET /attendance/effective/my — View computed attendance (Logic is here, but logically belongs to attendance domain. Placed here for service cohesion)
// Route path: /api/disputes/effective-attendance (or better: mounted separately in index if needed)
// Decision: Expose as /api/disputes/effective/my for now as consistent with student views
router.get('/effective/my', requireRole(['STUDENT']), disputeController.getEffectiveAttendance);


// -------------------------------------------------------
// Faculty APIs
// -------------------------------------------------------

// GET /disputes/class/:classId — View disputes for a class
router.get('/class/:classId', requireRole(['FACULTY', 'ADMIN', 'HOD']), disputeController.getClassDisputes);

// POST /disputes/:id/resolve — Approve/Reject dispute
router.post('/:id/resolve', requireRole(['FACULTY']), disputeController.resolveDispute);


// -------------------------------------------------------
// Admin/HOD APIs
// -------------------------------------------------------

// POST /disputes/override/:attendanceEntryId — Direct override
router.post('/override/:attendanceEntryId', requireRole(['ADMIN', 'HOD']), disputeController.overrideAttendance);

module.exports = router;
