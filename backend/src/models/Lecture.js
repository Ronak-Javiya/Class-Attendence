const mongoose = require('mongoose');

// -------------------------------------------------------
// Lecture Status Enum & Valid Transitions
// -------------------------------------------------------
const LECTURE_STATUSES = ['CREATED', 'PHOTO_UPLOADED', 'ATTENDANCE_GENERATED', 'LOCKED'];

const VALID_TRANSITIONS = {
    CREATED: ['PHOTO_UPLOADED'],
    PHOTO_UPLOADED: ['ATTENDANCE_GENERATED'],
    ATTENDANCE_GENERATED: ['LOCKED'],
    // LOCKED is terminal — no further transitions
};

const lectureSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: [true, 'Class reference is required'],
        },
        timetableSlotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Timetable',
            required: [true, 'Timetable slot reference is required'],
        },
        date: {
            type: String,
            required: [true, 'Lecture date is required'],
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Faculty reference is required'],
        },
        status: {
            type: String,
            enum: {
                values: LECTURE_STATUSES,
                message: 'Invalid lecture status: {VALUE}',
            },
            default: 'CREATED',
        },
    },
    {
        timestamps: true,
    }
);

// -------------------------------------------------------
// Indexes
// -------------------------------------------------------
// Only one lecture per class per slot per day
lectureSchema.index({ classId: 1, timetableSlotId: 1, date: 1 }, { unique: true });
lectureSchema.index({ createdBy: 1 });
lectureSchema.index({ status: 1 });

// -------------------------------------------------------
// Statics
// -------------------------------------------------------
lectureSchema.statics.VALID_TRANSITIONS = VALID_TRANSITIONS;
lectureSchema.statics.STATUSES = LECTURE_STATUSES;

const Lecture = mongoose.model('Lecture', lectureSchema);

module.exports = Lecture;
