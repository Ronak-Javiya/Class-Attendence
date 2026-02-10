const Enrollment = require('../models/Enrollment');
const Class = require('../models/Class');
const logger = require('../utils/logger');

// -------------------------------------------------------
// Student: Request Enrollment
// -------------------------------------------------------

/**
 * Student requests to join a class.
 * - Class must be ACTIVE.
 * - Student must not already have an enrollment for this class.
 * - Idempotent: duplicate key error is caught and returned as 409.
 */
const requestEnrollment = async (studentId, classId) => {
    // Verify class exists and is ACTIVE
    const cls = await Class.findById(classId);
    if (!cls) {
        const err = new Error('Class not found');
        err.statusCode = 404;
        throw err;
    }
    if (cls.status !== 'ACTIVE') {
        const err = new Error('Only ACTIVE classes accept enrollment requests');
        err.statusCode = 400;
        throw err;
    }

    // Check for existing enrollment (any status)
    const existing = await Enrollment.findOne({ studentId, classId });
    if (existing) {
        const err = new Error(`Enrollment already exists with status: ${existing.status}`);
        err.statusCode = 409;
        throw err;
    }

    const enrollment = await Enrollment.create({
        studentId,
        classId,
        status: 'REQUESTED',
        requestedAt: new Date(),
    });

    logger.info('Enrollment requested', { enrollmentId: enrollment._id, studentId, classId });
    return enrollment;
};

// -------------------------------------------------------
// Student: View My Enrollments
// -------------------------------------------------------

/**
 * Returns all enrollments for the given student, with class info populated.
 */
const getMyEnrollments = async (studentId) => {
    return Enrollment.find({ studentId })
        .populate('classId', 'title classCode status semester section')
        .sort({ createdAt: -1 });
};

// -------------------------------------------------------
// Admin: List Pending Enrollments
// -------------------------------------------------------

/**
 * Returns all REQUESTED enrollments.
 * Supports optional filtering by classId or departmentId.
 */
const getPendingEnrollments = async ({ classId, departmentId } = {}) => {
    const filter = { status: 'REQUESTED' };

    if (classId) {
        filter.classId = classId;
    }

    let query = Enrollment.find(filter)
        .populate('studentId', 'fullName email')
        .populate({
            path: 'classId',
            select: 'title classCode departmentId semester section',
            populate: { path: 'departmentId', select: 'name code' },
        })
        .sort({ requestedAt: 1 }); // Oldest first

    // If filtering by department, we filter after populate
    if (departmentId && !classId) {
        const results = await query;
        return results.filter(
            (e) => e.classId && e.classId.departmentId && e.classId.departmentId._id.toString() === departmentId
        );
    }

    return query;
};

// -------------------------------------------------------
// Admin: Approve Enrollment
// -------------------------------------------------------

/**
 * Admin approves a REQUESTED enrollment.
 * Transition: REQUESTED → APPROVED
 */
const approveEnrollment = async (enrollmentId, adminId) => {
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
        const err = new Error('Enrollment not found');
        err.statusCode = 404;
        throw err;
    }

    // Validate state transition
    if (enrollment.status !== 'REQUESTED') {
        const err = new Error(`Cannot approve enrollment with status: ${enrollment.status}`);
        err.statusCode = 400;
        throw err;
    }

    enrollment.status = 'APPROVED';
    enrollment.approvedAt = new Date();
    enrollment.approvedBy = adminId;
    await enrollment.save();

    logger.info('Enrollment approved', { enrollmentId, adminId });
    return enrollment;
};

// -------------------------------------------------------
// Admin: Reject Enrollment
// -------------------------------------------------------

/**
 * Admin rejects a REQUESTED enrollment with a reason.
 * Transition: REQUESTED → REJECTED
 */
const rejectEnrollment = async (enrollmentId, adminId, rejectionReason) => {
    if (!rejectionReason || !rejectionReason.trim()) {
        const err = new Error('Rejection reason is required');
        err.statusCode = 400;
        throw err;
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
        const err = new Error('Enrollment not found');
        err.statusCode = 404;
        throw err;
    }

    if (enrollment.status !== 'REQUESTED') {
        const err = new Error(`Cannot reject enrollment with status: ${enrollment.status}`);
        err.statusCode = 400;
        throw err;
    }

    enrollment.status = 'REJECTED';
    enrollment.rejectionReason = rejectionReason.trim();
    await enrollment.save();

    logger.info('Enrollment rejected', { enrollmentId, adminId, reason: rejectionReason });
    return enrollment;
};

// -------------------------------------------------------
// Faculty/Admin/HOD: View Enrolled Students for a Class
// -------------------------------------------------------

/**
 * Returns APPROVED students for a given class.
 * Faculty must be the class owner. Admin and HOD can view any class.
 */
const getClassStudents = async (classId, user) => {
    const cls = await Class.findById(classId);
    if (!cls) {
        const err = new Error('Class not found');
        err.statusCode = 404;
        throw err;
    }

    // Faculty can only view their own class
    if (user.role === 'FACULTY' && cls.facultyId.toString() !== user.userId.toString()) {
        const err = new Error('You can only view students in your own class');
        err.statusCode = 403;
        throw err;
    }

    // Return only APPROVED enrollments — Faculty cannot infer from other statuses
    return Enrollment.find({ classId, status: 'APPROVED' })
        .populate('studentId', 'fullName email')
        .sort({ approvedAt: 1 });
};

module.exports = {
    requestEnrollment,
    getMyEnrollments,
    getPendingEnrollments,
    approveEnrollment,
    rejectEnrollment,
    getClassStudents,
};
