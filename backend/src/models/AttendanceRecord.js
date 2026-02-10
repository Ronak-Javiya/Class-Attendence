const mongoose = require('mongoose');

/**
 * AttendanceRecord — Immutable aggregate record for one lecture.
 *
 * Created by the system worker after photo processing.
 * Once created, this record is permanently locked.
 */
const attendanceRecordSchema = new mongoose.Schema(
    {
        lectureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lecture',
            required: [true, 'Lecture reference is required'],
            unique: true, // One record per lecture
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: [true, 'Class reference is required'],
        },
        generatedAt: {
            type: Date,
            default: Date.now,
        },
        generationMethod: {
            type: String,
            enum: ['PHOTO_CLUSTER_V1'],
            default: 'PHOTO_CLUSTER_V1',
        },
        confidenceScore: {
            type: Number,
            min: 0,
            max: 1,
            default: 0,
        },
        status: {
            type: String,
            enum: ['AUTO_LOCKED'],
            default: 'AUTO_LOCKED',
        },
    },
    {
        timestamps: true,
    }
);

// -------------------------------------------------------
// Indexes
// -------------------------------------------------------
attendanceRecordSchema.index({ classId: 1 });

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);

module.exports = AttendanceRecord;
