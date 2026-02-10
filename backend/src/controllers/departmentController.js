const departmentService = require('../services/departmentService');
const { validateCreateDepartment } = require('../validators/classValidator');

/**
 * POST /departments
 * Creates a new department. Role: ADMIN or HOD.
 */
const createDepartment = async (req, res, next) => {
    try {
        const errors = validateCreateDepartment(req.body);
        if (errors) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        const department = await departmentService.createDepartment(req.body);
        res.status(201).json({ success: true, message: 'Department created', data: department });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /departments
 */
const getAllDepartments = async (req, res, next) => {
    try {
        const departments = await departmentService.getAllDepartments({ activeOnly: req.query.active === 'true' });
        res.status(200).json({ success: true, data: departments });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /departments/:id
 */
const getDepartmentById = async (req, res, next) => {
    try {
        const department = await departmentService.getDepartmentById(req.params.id);
        res.status(200).json({ success: true, data: department });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /departments/:id
 */
const updateDepartment = async (req, res, next) => {
    try {
        const department = await departmentService.updateDepartment(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Department updated', data: department });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
};
