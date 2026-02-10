const classService = require('../services/classService');
const { validateCreateClass, validateTimetableSlot } = require('../validators/classValidator');

/**
 * POST /classes
 * Creates a class in DRAFT status. Role: FACULTY.
 */
const createClass = async (req, res, next) => {
    try {
        const errors = validateCreateClass(req.body);
        if (errors) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        const cls = await classService.createClass({
            ...req.body,
            facultyId: req.user.userId, // Auto-assign creator
        });

        res.status(201).json({ success: true, message: 'Class created in DRAFT', data: cls });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /classes
 * Role-aware listing.
 */
const getClasses = async (req, res, next) => {
    try {
        const classes = await classService.getClasses(req.user);
        res.status(200).json({ success: true, data: classes });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /classes/:id
 */
const getClassById = async (req, res, next) => {
    try {
        const cls = await classService.getClassById(req.params.id, req.user);
        res.status(200).json({ success: true, data: cls });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /classes/:id/submit
 * Faculty submits class for HOD approval.
 */
const submitClass = async (req, res, next) => {
    try {
        const cls = await classService.submitClass(req.params.id, req.user.userId);
        res.status(200).json({ success: true, message: 'Class submitted for HOD approval', data: cls });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /classes/:id/approve
 * HOD approves a class.
 */
const approveClass = async (req, res, next) => {
    try {
        const cls = await classService.approveClass(req.params.id, req.user.userId);
        res.status(200).json({ success: true, message: 'Class approved', data: cls });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /classes/:id/reject
 * HOD rejects a class with a reason.
 */
const rejectClass = async (req, res, next) => {
    try {
        const cls = await classService.rejectClass(req.params.id, req.user.userId, req.body.rejectionReason);
        res.status(200).json({ success: true, message: 'Class rejected', data: cls });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /classes/:id/timetable
 * Faculty adds a timetable slot.
 */
const addTimetableSlot = async (req, res, next) => {
    try {
        const errors = validateTimetableSlot(req.body);
        if (errors) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        const slot = await classService.addTimetableSlot(req.params.id, req.user.userId, req.body);
        res.status(201).json({ success: true, message: 'Timetable slot added', data: slot });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /classes/:id/timetable
 * Read-only timetable view.
 */
const getTimetable = async (req, res, next) => {
    try {
        const slots = await classService.getTimetable(req.params.id);
        res.status(200).json({ success: true, data: slots });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createClass,
    getClasses,
    getClassById,
    submitClass,
    approveClass,
    rejectClass,
    addTimetableSlot,
    getTimetable,
};
