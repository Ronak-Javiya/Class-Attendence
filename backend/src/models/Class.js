const mongoose = require('mongoose');

const CLASS_STATUSES = ['DRAFT', 'PENDING_HOD_APPROVAL', 'ACTIVE', 'REJECTED', 'ARCHIVED'];

/**
 * Allowed status transitions (enforced in service layer):
 *   DRAFT                -> PENDING_HOD_APPROVAL  (Faculty submits)
 *   PENDING_HOD_APPROVAL -> ACTIVE                (HOD approves)
 *   PENDING_HOD_APPROVAL -> REJECTED              (HOD rejects)
 *   REJECTED             -> PENDING_HOD_APPROVAL  (Faculty re-submits after edits)
 */

const classSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Class title (subject name) is required'],
            trim: true,
            maxlength: [150, 'Title cannot exceed 150 characters'],
        },
        classCode: {
            type: String,
            required: [true, 'Class code is required'],
            unique: true,
            uppercase: true,
            trim: true,
            maxlength: [30, 'Class code cannot exceed 30 characters'],
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: [true, 'Department is required'],
        },
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Faculty (creator) is required'],
        },
        semester: {
            type: Number,
            required: [true, 'Semester is required'],
            min: [1, 'Semester must be at least 1'],
            max: [12, 'Semester cannot exceed 12'],
        },
        section: {
            type: String,
            required: [true, 'Section is required'],
            uppercase: true,
            trim: true,
            maxlength: [5, 'Section cannot exceed 5 characters'],
        },
        status: {
            type: String,
            enum: {
                values: CLASS_STATUSES,
                message: `Status must be one of: ${CLASS_STATUSES.join(', ')}`,
            },
            default: 'DRAFT',
        },
        rejectionReason: {
            type: String,
            default: null,
            trim: true,
            maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// -------------------------------------------------------
// Indexes
// -------------------------------------------------------
classSchema.index({ departmentId: 1, status: 1 });
classSchema.index({ facultyId: 1 });

// -------------------------------------------------------
// Statics
// -------------------------------------------------------
classSchema.statics.STATUSES = CLASS_STATUSES;

/**
 * Valid transitions map. Key = current status, Value = array of allowed next statuses.
 */
classSchema.statics.VALID_TRANSITIONS = {
    DRAFT: ['PENDING_HOD_APPROVAL'],
    PENDING_HOD_APPROVAL: ['ACTIVE', 'REJECTED'],
    REJECTED: ['PENDING_HOD_APPROVAL'],
    ACTIVE: ['ARCHIVED'],
    ARCHIVED: [],
};

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
