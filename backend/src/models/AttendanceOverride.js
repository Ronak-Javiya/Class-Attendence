const mongoose = require('mongoose');

/**
 * AttendanceOverride — The "effective correction" layer.
 *
 * This record takes precedence over the original immutable AttendanceEntry.
 * It stores strictly the change (e.g., ABSENT -> PRESENT) and metadata.
 */
const attendanceOverrideSchema = new mongoose.Schema(
    {
        attendanceEntryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AttendanceEntry',
            required: [true, 'Attendance entry reference is required'],
            unique: true, // Only one active override per entry
        },
        disputeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AttendanceDispute',
            default: null,
        },
        previousStatus: {
            type: String,
            required: true,
        },
        newStatus: {
            type: String,
            required: true,
            enum: ['PRESENT', 'ABSENT'],
        },
        confidenceOverride: {
            type: Number,
            default: null, // Optional override for confidence score
        },
        reason: {
            type: String,
            required: [true, 'Override reason is required'],
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Approver reference is required'],
        },
        approvedByRole: {
            type: String,
            enum: ['FACULTY', 'ADMIN', 'HOD'],
            required: true,
        },
        approvedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const AttendanceOverride = mongoose.model('AttendanceOverride', attendanceOverrideSchema);

module.exports = AttendanceOverride;
