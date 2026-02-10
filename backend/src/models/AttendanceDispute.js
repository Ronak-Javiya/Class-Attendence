const mongoose = require('mongoose');

// -------------------------------------------------------
// Dispute Status Enum & Valid Transitions
// -------------------------------------------------------
const DISPUTE_STATUSES = ['OPEN', 'FACULTY_APPROVED', 'FACULTY_REJECTED', 'ADMIN_OVERRIDDEN'];

const attendanceDisputeSchema = new mongoose.Schema(
    {
        attendanceEntryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AttendanceEntry',
            required: [true, 'Attendance entry reference is required'],
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student reference is required'],
        },
        lectureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lecture',
            required: [true, 'Lecture reference is required'],
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: [true, 'Class reference is required'],
        },
        reason: {
            type: String,
            required: [true, 'Dispute reason is required'],
            trim: true,
        },
        status: {
            type: String,
            enum: {
                values: DISPUTE_STATUSES,
                message: 'Invalid dispute status: {VALUE}',
            },
            default: 'OPEN',
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        resolvedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// -------------------------------------------------------
// Indexes
// -------------------------------------------------------
// A student can raise only one dispute per attendance entry
attendanceDisputeSchema.index({ attendanceEntryId: 1, studentId: 1 }, { unique: true });
attendanceDisputeSchema.index({ classId: 1 });
attendanceDisputeSchema.index({ status: 1 });

const AttendanceDispute = mongoose.model('AttendanceDispute', attendanceDisputeSchema);

module.exports = AttendanceDispute;
