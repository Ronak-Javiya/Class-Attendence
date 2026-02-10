const express = require('express');
const router = express.Router();

const departmentController = require('../controllers/departmentController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All department routes require authentication
router.use(requireAuth);

// POST /departments — Create department (ADMIN or HOD only)
router.post('/', requireRole(['ADMIN', 'HOD']), departmentController.createDepartment);

// GET /departments — List all departments (any authenticated user)
router.get('/', departmentController.getAllDepartments);

// GET /departments/:id — Get department details
router.get('/:id', departmentController.getDepartmentById);

// PUT /departments/:id — Update department (ADMIN or HOD only)
router.put('/:id', requireRole(['ADMIN', 'HOD']), departmentController.updateDepartment);

module.exports = router;
