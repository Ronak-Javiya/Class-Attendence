const Class = require('../models/Class');
const Timetable = require('../models/Timetable');
const Department = require('../models/Department');
const logger = require('../utils/logger');

// -------------------------------------------------------
// Class CRUD
// -------------------------------------------------------

/**
 * Create a new class in DRAFT status.
 * Only FACULTY can create. Faculty is auto-assigned as creator.
 */
const createClass = async ({ title, classCode, departmentId, semester, section, facultyId }) => {
    // Verify department exists
    const department = await Department.findById(departmentId);
    if (!department || !department.isActive) {
        const err = new Error('Department not found or inactive');
        err.statusCode = 404;
        throw err;
    }

    const cls = await Class.create({
        title: title.trim(),
        classCode: classCode.trim().toUpperCase(),
        departmentId,
        facultyId,
        semester,
        section: section.trim().toUpperCase(),
        status: 'DRAFT',
    });

    logger.info('Class created', { classId: cls._id, classCode: cls.classCode, facultyId });
    return cls;
};

/**
 * Get classes with role-based filtering.
 *   - FACULTY: own classes (all statuses)
 *   - HOD: department classes (all statuses, must match HOD's department)
 *   - ADMIN/STUDENT: only ACTIVE classes
 */
const getClasses = async (user) => {
    let filter = {};

    if (user.role === 'FACULTY') {
        filter = { facultyId: user.userId };
    } else if (user.role === 'HOD') {
        // Find the department(s) this HOD manages
        const departments = await Department.find({ hodId: user.userId });
        const deptIds = departments.map((d) => d._id);
        filter = { departmentId: { $in: deptIds } };
    } else {
        // ADMIN and STUDENT see only ACTIVE classes
        filter = { status: 'ACTIVE' };
    }

    return Class.find(filter)
        .populate('departmentId', 'name code')
        .populate('facultyId', 'fullName email')
        .sort({ createdAt: -1 });
};

/**
 * Get a single class by ID (with permission check).
 */
const getClassById = async (classId, user) => {
    const cls = await Class.findById(classId)
        .populate('departmentId', 'name code')
        .populate('facultyId', 'fullName email');

    if (!cls) {
        const err = new Error('Class not found');
        err.statusCode = 404;
        throw err;
    }

    // Permission check
    if (user.role === 'FACULTY' && cls.facultyId._id.toString() !== user.userId.toString()) {
        const err = new Error('You can only view your own classes');
        err.statusCode = 403;
        throw err;
    }
    if (user.role === 'HOD') {
        const dept = await Department.findOne({ _id: cls.departmentId._id, hodId: user.userId });
        if (!dept) {
            const err = new Error('You can only view classes in your department');
            err.statusCode = 403;
            throw err;
        }
    }
    if ((user.role === 'ADMIN' || user.role === 'STUDENT') && cls.status !== 'ACTIVE') {
        const err = new Error('Class is not accessible');
        err.statusCode = 403;
        throw err;
    }

    return cls;
};

// -------------------------------------------------------
// State Transitions
// -------------------------------------------------------

/**
 * Submit a class for HOD approval.
 * Transition: DRAFT -> PENDING_HOD_APPROVAL
 *             REJECTED -> PENDING_HOD_APPROVAL (re-submit)
 * Requirement: Must have at least one timetable slot.
 */
const submitClass = async (classId, facultyId) => {
    const cls = await Class.findById(classId);
    if (!cls) {
        const err = new Error('Class not found');
        err.statusCode = 404;
        throw err;
    }

    // Only the creator can submit
    if (cls.facultyId.toString() !== facultyId.toString()) {
        const err = new Error('Only the class creator can submit for approval');
        err.statusCode = 403;
        throw err;
    }

    // Validate status transition
    const allowed = Class.VALID_TRANSITIONS[cls.status];
    if (!allowed || !allowed.includes('PENDING_HOD_APPROVAL')) {
        const err = new Error(`Cannot submit class from status: ${cls.status}`);
        err.statusCode = 400;
        throw err;
    }

    // Must have at least one timetable slot
    const slotCount = await Timetable.countDocuments({ classId: cls._id, isActive: true });
    if (slotCount === 0) {
        const err = new Error('Class must have at least one timetable slot before submission');
        err.statusCode = 400;
        throw err;
    }

    cls.status = 'PENDING_HOD_APPROVAL';
    cls.rejectionReason = null; // Clear previous rejection if re-submitting
    await cls.save();

    logger.info('Class submitted for approval', { classId: cls._id, facultyId });
    return cls;
};

/**
 * Approve a class.
 * Transition: PENDING_HOD_APPROVAL -> ACTIVE
 * Only the HOD of the same department can approve.
 */
const approveClass = async (classId, hodUserId) => {
    const cls = await Class.findById(classId);
    if (!cls) {
        const err = new Error('Class not found');
        err.statusCode = 404;
        throw err;
    }

    // Verify transition
    if (cls.status !== 'PENDING_HOD_APPROVAL') {
        const err = new Error(`Cannot approve class with status: ${cls.status}`);
        err.statusCode = 400;
        throw err;
    }

    // Verify HOD belongs to the same department
    const dept = await Department.findOne({ _id: cls.departmentId, hodId: hodUserId });
    if (!dept) {
        const err = new Error('You are not the HOD of this department');
        err.statusCode = 403;
        throw err;
    }

    // Faculty cannot approve their own class (even if they were somehow also HOD)
    if (cls.facultyId.toString() === hodUserId.toString()) {
        const err = new Error('Cannot approve your own class');
        err.statusCode = 403;
        throw err;
    }

    cls.status = 'ACTIVE';
    await cls.save();

    logger.info('Class approved', { classId: cls._id, hodUserId });
    return cls;
};

/**
 * Reject a class.
 * Transition: PENDING_HOD_APPROVAL -> REJECTED
 * Requires a rejection reason.
 */
const rejectClass = async (classId, hodUserId, rejectionReason) => {
    if (!rejectionReason || !rejectionReason.trim()) {
        const err = new Error('Rejection reason is required');
        err.statusCode = 400;
        throw err;
    }

    const cls = await Class.findById(classId);
    if (!cls) {
        const err = new Error('Class not found');
        err.statusCode = 404;
        throw err;
    }

    if (cls.status !== 'PENDING_HOD_APPROVAL') {
        const err = new Error(`Cannot reject class with status: ${cls.status}`);
        err.statusCode = 400;
        throw err;
    }

    // Verify HOD belongs to the same department
    const dept = await Department.findOne({ _id: cls.departmentId, hodId: hodUserId });
    if (!dept) {
        const err = new Error('You are not the HOD of this department');
        err.statusCode = 403;
        throw err;
    }

    cls.status = 'REJECTED';
    cls.rejectionReason = rejectionReason.trim();
    await cls.save();

    logger.info('Class rejected', { classId: cls._id, hodUserId, reason: rejectionReason });
    return cls;
};

// -------------------------------------------------------
// Timetable Management
// -------------------------------------------------------

/**
 * Add a timetable slot to a class.
 * Only allowed for the class creator, and only in DRAFT or REJECTED status.
 * Checks for overlapping time slots within the same class and day.
 */
const addTimetableSlot = async (classId, facultyId, { dayOfWeek, startTime, endTime }) => {
    const cls = await Class.findById(classId);
    if (!cls) {
        const err = new Error('Class not found');
        err.statusCode = 404;
        throw err;
    }

    // Only creator can modify timetable
    if (cls.facultyId.toString() !== facultyId.toString()) {
        const err = new Error('Only the class creator can modify the timetable');
        err.statusCode = 403;
        throw err;
    }

    // Only allowed in DRAFT or REJECTED status
    if (!['DRAFT', 'REJECTED'].includes(cls.status)) {
        const err = new Error(`Cannot modify timetable when class status is: ${cls.status}`);
        err.statusCode = 400;
        throw err;
    }

    // Check for overlapping slots on the same day for this class
    const overlapping = await Timetable.findOne({
        classId,
        dayOfWeek,
        isActive: true,
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
        ],
    });

    if (overlapping) {
        const err = new Error(
            `Time slot overlaps with existing slot: ${overlapping.startTime}-${overlapping.endTime}`
        );
        err.statusCode = 409;
        throw err;
    }

    const slot = await Timetable.create({
        classId,
        dayOfWeek,
        startTime,
        endTime,
    });

    logger.info('Timetable slot added', { classId, slotId: slot._id });
    return slot;
};

/**
 * Get all timetable slots for a class.
 */
const getTimetable = async (classId) => {
    // Verify class exists
    const cls = await Class.findById(classId);
    if (!cls) {
        const err = new Error('Class not found');
        err.statusCode = 404;
        throw err;
    }

    return Timetable.find({ classId, isActive: true }).sort({ dayOfWeek: 1, startTime: 1 });
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
