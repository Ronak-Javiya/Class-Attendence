const Department = require('../models/Department');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Create a new department.
 * Only ADMIN or HOD should call this (enforced at route level).
 */
const createDepartment = async ({ name, code, hodId }) => {
    // If hodId is provided, verify the user exists and has HOD role
    if (hodId) {
        const hodUser = await User.findById(hodId);
        if (!hodUser) {
            const err = new Error('HOD user not found');
            err.statusCode = 404;
            throw err;
        }
        if (hodUser.role !== 'HOD') {
            const err = new Error('Assigned user does not have the HOD role');
            err.statusCode = 400;
            throw err;
        }
    }

    const department = await Department.create({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        hodId: hodId || null,
    });

    logger.info('Department created', { departmentId: department._id, code: department.code });
    return department;
};

/**
 * Get all departments (optionally filtered by active status).
 */
const getAllDepartments = async ({ activeOnly = false } = {}) => {
    const filter = activeOnly ? { isActive: true } : {};
    return Department.find(filter).populate('hodId', 'fullName email').sort({ code: 1 });
};

/**
 * Get a single department by ID.
 */
const getDepartmentById = async (departmentId) => {
    const department = await Department.findById(departmentId).populate('hodId', 'fullName email');
    if (!department) {
        const err = new Error('Department not found');
        err.statusCode = 404;
        throw err;
    }
    return department;
};

/**
 * Update a department.
 */
const updateDepartment = async (departmentId, updates) => {
    const department = await Department.findById(departmentId);
    if (!department) {
        const err = new Error('Department not found');
        err.statusCode = 404;
        throw err;
    }

    // If updating hodId, validate the user
    if (updates.hodId) {
        const hodUser = await User.findById(updates.hodId);
        if (!hodUser || hodUser.role !== 'HOD') {
            const err = new Error('Invalid HOD user');
            err.statusCode = 400;
            throw err;
        }
    }

    Object.assign(department, updates);
    await department.save();

    logger.info('Department updated', { departmentId: department._id });
    return department;
};

module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
};
