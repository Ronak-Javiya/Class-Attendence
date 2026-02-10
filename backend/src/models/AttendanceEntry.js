const mongoose = require('mongoose');

/**
 * AttendanceEntry — One entry per student per lecture.
 *
 * Created by the system worker; immutable once written.
 * PRESENT / ABSENT is determined by the AI pipeline (or stub).
 */
const attendanceEntrySchema = new mongoose.Schema(
    {
        attendanceRecordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AttendanceRecord',
            required: [true, 'Attendance record reference is required'],
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student reference is required'],
        },
        status: {
            type: String,
            enum: {
                values: ['PRESENT', 'ABSENT'],
                message: 'Status must be PRESENT or ABSENT',
            },
            required: [true, 'Attendance status is required'],
        },
        confidenceScore: {
            type: Number,
            min: 0,
            max: 1,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// -------------------------------------------------------
// Indexes
// -------------------------------------------------------
// One entry per student per record (enforces uniqueness)
attendanceEntrySchema.index({ attendanceRecordId: 1, studentId: 1 }, { unique: true });
attendanceEntrySchema.index({ studentId: 1 });

const AttendanceEntry = mongoose.model('AttendanceEntry', attendanceEntrySchema);

module.exports = AttendanceEntry;
