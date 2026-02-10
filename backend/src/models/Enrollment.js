const mongoose = require('mongoose');

// -------------------------------------------------------
// Status Enum & Valid Transitions
// -------------------------------------------------------
const ENROLLMENT_STATUSES = ['REQUESTED', 'APPROVED', 'REJECTED', 'SUSPENDED'];

const VALID_TRANSITIONS = {
    REQUESTED: ['APPROVED', 'REJECTED'],
    APPROVED: ['SUSPENDED'],
    // No transitions allowed from REJECTED or SUSPENDED
};

const enrollmentSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student reference is required'],
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: [true, 'Class reference is required'],
        },
        status: {
            type: String,
            enum: {
                values: ENROLLMENT_STATUSES,
                message: 'Invalid enrollment status: {VALUE}',
            },
            default: 'REQUESTED',
        },
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        approvedAt: {
            type: Date,
            default: null,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        rejectionReason: {
            type: String,
            default: null,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// -------------------------------------------------------
// Indexes
// -------------------------------------------------------
// A student can only have ONE enrollment per class (idempotent guard)
enrollmentSchema.index({ studentId: 1, classId: 1 }, { unique: true });
enrollmentSchema.index({ classId: 1 });
enrollmentSchema.index({ status: 1 });

// -------------------------------------------------------
// Statics
// -------------------------------------------------------
enrollmentSchema.statics.VALID_TRANSITIONS = VALID_TRANSITIONS;
enrollmentSchema.statics.STATUSES = ENROLLMENT_STATUSES;

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
