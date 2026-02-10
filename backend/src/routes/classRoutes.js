const express = require('express');
const router = express.Router();

const classController = require('../controllers/classController');
const enrollmentController = require('../controllers/enrollmentController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All class routes require authentication
router.use(requireAuth);

// -------------------------------------------------------
// Class CRUD
// -------------------------------------------------------

// POST /classes — Create class (FACULTY only)
router.post('/', requireRole(['FACULTY']), classController.createClass);

// GET /classes — List classes (role-aware filtering)
router.get('/', classController.getClasses);

// GET /classes/:id — Get class details
router.get('/:id', classController.getClassById);

// -------------------------------------------------------
// State Transitions
// -------------------------------------------------------

// POST /classes/:id/submit — Submit class for HOD approval (FACULTY only)
router.post('/:id/submit', requireRole(['FACULTY']), classController.submitClass);

// POST /classes/:id/approve — Approve class (HOD only)
router.post('/:id/approve', requireRole(['HOD']), classController.approveClass);

// POST /classes/:id/reject — Reject class (HOD only)
router.post('/:id/reject', requireRole(['HOD']), classController.rejectClass);

// -------------------------------------------------------
// Timetable
// -------------------------------------------------------

// POST /classes/:id/timetable — Add timetable slot (FACULTY only)
router.post('/:id/timetable', requireRole(['FACULTY']), classController.addTimetableSlot);

// GET /classes/:id/timetable — View timetable (any authenticated user)
router.get('/:id/timetable', classController.getTimetable);

// -------------------------------------------------------
// Enrollment: View Enrolled Students (Module 3)
// -------------------------------------------------------

// GET /classes/:classId/students — Faculty (own class), Admin, HOD
router.get('/:classId/students', requireRole(['FACULTY', 'ADMIN', 'HOD']), enrollmentController.getClassStudents);

module.exports = router;
