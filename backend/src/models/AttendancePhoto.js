const mongoose = require('mongoose');

/**
 * AttendancePhoto — Evidence photo attached to a lecture.
 *
 * Photos are append-only: no deletion, no replacement.
 * storageUrl is a mock path for MVP; will be replaced by
 * cloud storage (S3/GCS) in production.
 */
const attendancePhotoSchema = new mongoose.Schema(
    {
        lectureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lecture',
            required: [true, 'Lecture reference is required'],
        },
        storageUrl: {
            type: String,
            required: [true, 'Storage URL is required'],
            trim: true,
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Uploader reference is required'],
        },
    },
    {
        timestamps: true,
    }
);

// -------------------------------------------------------
// Indexes
// -------------------------------------------------------
attendancePhotoSchema.index({ lectureId: 1 });

const AttendancePhoto = mongoose.model('AttendancePhoto', attendancePhotoSchema);

module.exports = AttendancePhoto;
