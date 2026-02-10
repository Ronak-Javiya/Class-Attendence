const Lecture = require('../models/Lecture');
const AttendanceEntry = require('../models/AttendanceEntry');
const AttendanceDispute = require('../models/AttendanceDispute');
const AttendanceOverride = require('../models/AttendanceOverride');
const AuditLog = require('../models/AuditLog');
const Class = require('../models/Class');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// -------------------------------------------------------
// Helper: Create Audit Log
// -------------------------------------------------------
const createAuditLog = async ({ action, performedBy, performedByRole, entityType, entityId, payload }) => {
    await AuditLog.create({
        action,
        performedBy,
        performedByRole,
        entityType,
        entityId,
        payload,
    });
};

// -------------------------------------------------------
// Student: Raise Dispute
// -------------------------------------------------------

/**
 * Raises a dispute for an ABSENT attendance entry.
 * Validations:
 * - Entry must exist and belong to student.
 * - Entry status must be ABSENT (cannot dispute PRESENT).
 * - Time window: <= 72 hours from Lecture Date (end of day).
 * - One active dispute per entry.
 */
const raiseDispute = async (studentId, { attendanceEntryId, reason }) => {
    const entry = await AttendanceEntry.findById(attendanceEntryId)
        .populate('attendanceRecordId');

    if (!entry) {
        const err = new Error('Attendance entry not found');
        err.statusCode = 404;
        throw err;
    }

    if (entry.studentId.toString() !== studentId.toString()) {
        const err = new Error('Cannot dispute another student\'s attendance');
        err.statusCode = 403;
        throw err;
    }

    if (entry.status !== 'ABSENT') {
        const err = new Error('Only ABSENT entries can be disputed');
        err.statusCode = 400;
        throw err;
    }

    // Time Window Check (72 hours)
    const lecture = await Lecture.findById(entry.attendanceRecordId.lectureId);
    const lectureDate = new Date(lecture.date);
    const deadline = new Date(lectureDate.getTime() + 72 * 60 * 60 * 1000);
    const now = new Date();

    if (now > deadline) {
        const err = new Error('Dispute window (72 hours) has expired');
        err.statusCode = 400;
        throw err;
    }

    // Check for existing dispute
    const existing = await AttendanceDispute.findOne({ attendanceEntryId });
    if (existing) {
        const err = new Error(`Dispute already exists with status: ${existing.status}`);
        err.statusCode = 409;
        throw err;
    }

    const dispute = await AttendanceDispute.create({
        attendanceEntryId,
        studentId,
        lectureId: lecture._id,
        classId: lecture.classId,
        reason,
        status: 'OPEN',
    });

    // Audit Log
    await createAuditLog({
        action: 'DISPUTE_RAISED',
        performedBy: studentId,
        performedByRole: 'STUDENT',
        entityType: 'AttendanceDispute',
        entityId: dispute._id,
        payload: { reason },
    });

    return dispute;
};

// -------------------------------------------------------
// Student: Get My Disputes
// -------------------------------------------------------
const getMyDisputes = async (studentId) => {
    return AttendanceDispute.find({ studentId })
        .populate({
            path: 'lectureId',
            select: 'date timetableSlotId',
            populate: { path: 'timetableSlotId', select: 'startTime endTime dayOfWeek' }
        })
        .sort({ createdAt: -1 });
};

// -------------------------------------------------------
// Faculty: Get Class Disputes
// -------------------------------------------------------
const getClassDisputes = async (classId, user) => {
    const cls = await Class.findById(classId);
    if (!cls) {
        const err = new Error('Class not found');
        err.statusCode = 404;
        throw err;
    }

    if (user.role === 'FACULTY' && cls.facultyId.toString() !== user.userId.toString()) {
        const err = new Error('You can only view disputes for your own class');
        err.statusCode = 403;
        throw err;
    }

    // Return OPEN disputes first
    return AttendanceDispute.find({ classId })
        .populate('studentId', 'fullName email')
        .populate('lectureId', 'date')
        .sort({ status: 1, createdAt: 1 }); // OPEN comes before F...
};

// -------------------------------------------------------
// Faculty: Resolve Dispute
// -------------------------------------------------------

/**
 * Faculty approves or rejects a dispute.
 * - APPROVE: Creates AttendanceOverride (ABSENT -> PRESENT).
 * - REJECT: Updates status only.
 */
const resolveDispute = async (disputeId, facultyId, { action, comment }) => {
    const dispute = await AttendanceDispute.findById(disputeId);
    if (!dispute) {
        const err = new Error('Dispute not found');
        err.statusCode = 404;
        throw err;
    }

    // Check ownership
    const cls = await Class.findById(dispute.classId);
    if (cls.facultyId.toString() !== facultyId.toString()) {
        const err = new Error('Only the class faculty can resolve this dispute');
        err.statusCode = 403;
        throw err;
    }

    if (dispute.status !== 'OPEN') {
        const err = new Error(`Dispute is already resolved (Status: ${dispute.status})`);
        err.statusCode = 400;
        throw err;
    }

    if (action === 'APPROVE') {
        dispute.status = 'FACULTY_APPROVED';

        // Create Override
        await AttendanceOverride.create({
            attendanceEntryId: dispute.attendanceEntryId,
            disputeId: dispute._id,
            previousStatus: 'ABSENT',
            newStatus: 'PRESENT',
            reason: `Dispute Approved: ${comment}`,
            approvedBy: facultyId,
            approvedByRole: 'FACULTY',
        });
    } else {
        dispute.status = 'FACULTY_REJECTED';
    }

    dispute.resolvedBy = facultyId;
    dispute.resolvedAt = new Date();
    await dispute.save();

    // Audit Log
    await createAuditLog({
        action: 'DISPUTE_RESULT',
        performedBy: facultyId,
        performedByRole: 'FACULTY',
        entityType: 'AttendanceDispute',
        entityId: dispute._id,
        payload: { action, comment },
    });

    return dispute;
};

// -------------------------------------------------------
// Admin/HOD: Override Decision
// -------------------------------------------------------

/**
 * Can override a dispute decision OR directly override an entry (if no dispute exists, logic extended).
 * Currently focused on overriding via dispute reference or direct entry ID.
 */
const adminOverride = async (attendanceEntryId, adminId, role, { newStatus, reason }) => {
    const entry = await AttendanceEntry.findById(attendanceEntryId);
    if (!entry) {
        const err = new Error('Attendance entry not found');
        err.statusCode = 404;
        throw err;
    }

    // Check for existing override
    let override = await AttendanceOverride.findOne({ attendanceEntryId });
    const previousStatus = override ? override.newStatus : entry.status;

    // Upsert Override
    if (override) {
        override.previousStatus = override.newStatus; // Chain history
        override.newStatus = newStatus;
        override.reason = reason;
        override.approvedBy = adminId;
        override.approvedByRole = role;
        override.approvedAt = new Date();
        await override.save();
    } else {
        override = await AttendanceOverride.create({
            attendanceEntryId,
            previousStatus: entry.status,
            newStatus,
            reason,
            approvedBy: adminId,
            approvedByRole: role,
        });
    }

    // If there's a related dispute, update its status
    const dispute = await AttendanceDispute.findOne({ attendanceEntryId });
    if (dispute) {
        dispute.status = 'ADMIN_OVERRIDDEN';
        dispute.resolvedBy = adminId;
        dispute.resolvedAt = new Date();
        await dispute.save();
    }

    // Audit Log
    await createAuditLog({
        action: 'ADMIN_OVERRIDE',
        performedBy: adminId,
        performedByRole: role,
        entityType: 'AttendanceOverride',
        entityId: override._id,
        payload: { previousStatus, newStatus, reason },
    });

    return override;
};

// -------------------------------------------------------
// Student: Effective Attendance
// -------------------------------------------------------

/**
 * Returns effective attendance (Original + Override).
 */
const getEffectiveAttendance = async (studentId) => {
    const entries = await AttendanceEntry.find({ studentId })
        .populate({
            path: 'attendanceRecordId',
            populate: {
                path: 'lectureId',
                select: 'date timetableSlotId classId',
                populate: [
                    { path: 'timetableSlotId', select: 'dayOfWeek startTime endTime' },
                    { path: 'classId', select: 'title classCode' }
                ]
            },
        })
        .sort({ createdAt: -1 });

    // Fetch overrides for these entries
    const entryIds = entries.map(e => e._id);
    const overrides = await AttendanceOverride.find({ attendanceEntryId: { $in: entryIds } });

    // Map overrides by entryId
    const overrideMap = {};
    overrides.forEach(o => {
        overrideMap[o.attendanceEntryId.toString()] = o;
    });

    // Combine
    return entries.map(entry => {
        const override = overrideMap[entry._id.toString()];
        return {
            _id: entry._id,
            lecture: entry.attendanceRecordId.lectureId,
            originalStatus: entry.status,
            effectiveStatus: override ? override.newStatus : entry.status,
            isOverridden: !!override,
            overrideReason: override ? override.reason : null,
            confidenceScore: entry.confidenceScore
        };
    });
};

module.exports = {
    raiseDispute,
    getMyDisputes,
    getClassDisputes,
    resolveDispute,
    adminOverride,
    getEffectiveAttendance,
};
