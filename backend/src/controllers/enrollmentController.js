const enrollmentService = require('../services/enrollmentService');
const { validateEnrollmentRequest, validateRejection } = require('../validators/enrollmentValidator');

// -------------------------------------------------------
// Student: Request Enrollment
// -------------------------------------------------------
const requestEnrollment = async (req, res, next) => {
    try {
        const errors = validateEnrollmentRequest(req.body);
        if (errors) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        const enrollment = await enrollmentService.requestEnrollment(req.user.userId, req.body.classId);
        res.status(201).json({ success: true, message: 'Enrollment requested', data: enrollment });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Student: View My Enrollments
// -------------------------------------------------------
const getMyEnrollments = async (req, res, next) => {
    try {
        const enrollments = await enrollmentService.getMyEnrollments(req.user.userId);
        res.status(200).json({ success: true, data: enrollments });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Admin: List All Enrollments with Status Filter
// -------------------------------------------------------
const getAllEnrollments = async (req, res, next) => {
    try {
        const { status, classId, departmentId } = req.query;
        
        let enrollments;
        if (status === 'PENDING') {
            enrollments = await enrollmentService.getPendingEnrollments({ classId, departmentId });
        } else if (status) {
            // Filter by specific status
            const Enrollment = require('../models/Enrollment');
            const query = { status };
            if (classId) query.classId = classId;
            enrollments = await Enrollment.find(query)
                .populate('studentId', 'fullName email')
                .populate('classId', 'name code')
                .sort({ createdAt: -1 });
        } else {
            // Get all enrollments
            const Enrollment = require('../models/Enrollment');
            const query = {};
            if (classId) query.classId = classId;
            enrollments = await Enrollment.find(query)
                .populate('studentId', 'fullName email')
                .populate('classId', 'name code')
                .sort({ createdAt: -1 });
        }
        
        res.status(200).json({ success: true, data: enrollments });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Admin: List Pending Enrollments
// -------------------------------------------------------
const getPendingEnrollments = async (req, res, next) => {
    try {
        const enrollments = await enrollmentService.getPendingEnrollments({
            classId: req.query.classId,
            departmentId: req.query.departmentId,
        });
        res.status(200).json({ success: true, data: enrollments });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Admin: Approve Enrollment
// -------------------------------------------------------
const approveEnrollment = async (req, res, next) => {
    try {
        const enrollment = await enrollmentService.approveEnrollment(req.params.id, req.user.userId);
        res.status(200).json({ success: true, message: 'Enrollment approved', data: enrollment });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Admin: Reject Enrollment
// -------------------------------------------------------
const rejectEnrollment = async (req, res, next) => {
    try {
        const errors = validateRejection(req.body);
        if (errors) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        const enrollment = await enrollmentService.rejectEnrollment(
            req.params.id,
            req.user.userId,
            req.body.rejectionReason
        );
        res.status(200).json({ success: true, message: 'Enrollment rejected', data: enrollment });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Faculty/Admin/HOD: View Enrolled Students
// -------------------------------------------------------
const getClassStudents = async (req, res, next) => {
    try {
        const students = await enrollmentService.getClassStudents(req.params.classId, req.user);
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    requestEnrollment,
    getMyEnrollments,
    getAllEnrollments,
    getPendingEnrollments,
    approveEnrollment,
    rejectEnrollment,
    getClassStudents,
};
