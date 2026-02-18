const disputeService = require('../services/disputeService');
const Class = require('../models/Class');
const { validateCreateDispute, validateResolveDispute, validateOverride } = require('../validators/disputeValidator');

// -------------------------------------------------------
// Student: Raise Dispute
// -------------------------------------------------------
const raiseDispute = async (req, res, next) => {
    try {
        const errors = validateCreateDispute(req.body);
        if (errors) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        const dispute = await disputeService.raiseDispute(req.user.userId, req.body);
        res.status(201).json({ success: true, message: 'Dispute raised successfully', data: dispute });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Student: Get My Disputes
// -------------------------------------------------------
const getMyDisputes = async (req, res, next) => {
    try {
        const disputes = await disputeService.getMyDisputes(req.user.userId);
        res.status(200).json({ success: true, data: disputes });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Faculty: Get Class Disputes
// -------------------------------------------------------
const getClassDisputes = async (req, res, next) => {
    try {
        const disputes = await disputeService.getClassDisputes(req.params.classId, req.user);
        res.status(200).json({ success: true, data: disputes });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Faculty: Resolve Dispute
// -------------------------------------------------------
const resolveDispute = async (req, res, next) => {
    try {
        const errors = validateResolveDispute(req.body);
        if (errors) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        const result = await disputeService.resolveDispute(
            req.params.id,
            req.user.userId,
            req.body
        );
        res.status(200).json({ success: true, message: 'Dispute resolved', data: result });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Admin/HOD: Override
// -------------------------------------------------------
const overrideAttendance = async (req, res, next) => {
    try {
        const errors = validateOverride(req.body);
        if (errors) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        // Param is attendanceEntryId because overrides target the entry directly
        const result = await disputeService.adminOverride(
            req.params.attendanceEntryId,
            req.user.userId,
            req.user.role,
            req.body
        );
        res.status(200).json({ success: true, message: 'Attendance overridden', data: result });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Student: Effective Attendance
// -------------------------------------------------------
const getEffectiveAttendance = async (req, res, next) => {
    try {
        const attendance = await disputeService.getEffectiveAttendance(req.user.userId);
        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Faculty: Get Pending Disputes Count
// -------------------------------------------------------
const getPendingDisputes = async (req, res, next) => {
    try {
        const user = req.user;
        let query = { status: 'OPEN' };
        
        // If faculty, restrict to their classes
        if (user.role === 'FACULTY') {
            const classes = await Class.find({ facultyId: user.userId });
            const classIds = classes.map(c => c._id);
            query.classId = { $in: classIds };
        }
        
        const disputes = await AttendanceDispute.find(query)
            .populate('studentId', 'fullName email')
            .populate('classId', 'name code')
            .populate('lectureId', 'date')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, data: disputes });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Faculty: Get All Faculty Disputes
// -------------------------------------------------------
const getFacultyDisputes = async (req, res, next) => {
    try {
        const user = req.user;
        const classes = await Class.find({ facultyId: user.userId });
        const classIds = classes.map(c => c._id);
        
        const disputes = await AttendanceDispute.find({ classId: { $in: classIds } })
            .populate('studentId', 'fullName email')
            .populate('classId', 'name code')
            .populate('lectureId', 'date')
            .sort({ status: 1, createdAt: -1 });
        
        res.status(200).json({ success: true, data: disputes });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    raiseDispute,
    getMyDisputes,
    getClassDisputes,
    resolveDispute,
    overrideAttendance,
    getEffectiveAttendance,
    getPendingDisputes,
    getFacultyDisputes,
};
