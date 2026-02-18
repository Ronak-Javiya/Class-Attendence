const express = require('express');
const router = express.Router();

const attendanceController = require('../controllers/attendanceController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(requireAuth);

// -------------------------------------------------------
// Lecture APIs (Faculty only)
// -------------------------------------------------------

// POST /lectures — Create a lecture session
router.post('/lectures', requireRole(['FACULTY']), attendanceController.createLecture);

// POST /lectures/:id/photos — Upload evidence photos
router.post('/lectures/:id/photos', requireRole(['FACULTY']), attendanceController.uploadPhotos);

// GET /lectures/today — Faculty views today's lectures
router.get('/lectures/today', requireRole(['FACULTY']), attendanceController.getTodaysLectures);

// -------------------------------------------------------
// Read-Only APIs
// -------------------------------------------------------

// GET /attendance/my — Student views own attendance
router.get('/attendance/my', requireRole(['STUDENT']), attendanceController.getMyAttendance);

// GET /attendance/class/:classId — Faculty/Admin/HOD views class attendance
router.get(
    '/attendance/class/:classId',
    requireRole(['FACULTY', 'ADMIN', 'HOD']),
    attendanceController.getClassAttendance
);

// GET /attendance/search — Admin/HOD searches attendance
router.get(
    '/attendance/search',
    requireRole(['ADMIN', 'HOD']),
    attendanceController.searchAttendance
);

// GET /overrides/history — Admin/HOD views override history
router.get(
    '/overrides/history',
    requireRole(['ADMIN', 'HOD']),
    attendanceController.getOverridesHistory
);

module.exports = router;
