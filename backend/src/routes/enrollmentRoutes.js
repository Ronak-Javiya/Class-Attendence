const express = require('express');
const router = express.Router();

const enrollmentController = require('../controllers/enrollmentController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All enrollment routes require authentication
router.use(requireAuth);

// -------------------------------------------------------
// Student APIs
// -------------------------------------------------------

// POST /enrollments/request — Student requests enrollment
router.post('/request', requireRole(['STUDENT']), enrollmentController.requestEnrollment);

// GET /enrollments/my — Student views own enrollments
router.get('/my', requireRole(['STUDENT']), enrollmentController.getMyEnrollments);

// -------------------------------------------------------
// Admin APIs
// -------------------------------------------------------

// GET /enrollments — Admin views all enrollments with optional status filter
router.get('/', requireRole(['ADMIN']), enrollmentController.getAllEnrollments);

// GET /enrollments/pending — Admin views pending requests
router.get('/pending', requireRole(['ADMIN']), enrollmentController.getPendingEnrollments);

// POST /enrollments/:id/approve — Admin approves enrollment
router.post('/:id/approve', requireRole(['ADMIN']), enrollmentController.approveEnrollment);

// POST /enrollments/:id/reject — Admin rejects enrollment
router.post('/:id/reject', requireRole(['ADMIN']), enrollmentController.rejectEnrollment);

// -------------------------------------------------------
// Faculty/Admin/HOD: View class students
// -------------------------------------------------------

// GET /classes/:classId/students — View approved students (own class for Faculty)
// NOTE: This route is mounted on /api/classes via classRoutes, not here.
//       Exported separately for wiring.

module.exports = router;
