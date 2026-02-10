const mongoose = require('mongoose');

const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6]; // 0 = Sunday, 6 = Saturday

const timetableSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: [true, 'Class reference is required'],
        },
        dayOfWeek: {
            type: Number,
            required: [true, 'Day of week is required'],
            enum: {
                values: DAYS_OF_WEEK,
                message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)',
            },
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format (24-hour)'],
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format (24-hour)'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// -------------------------------------------------------
// Indexes
// -------------------------------------------------------
timetableSchema.index({ classId: 1, dayOfWeek: 1 });

// -------------------------------------------------------
// Pre-validate: ensure endTime > startTime
// -------------------------------------------------------
timetableSchema.pre('validate', function () {
    if (this.startTime && this.endTime) {
        if (this.startTime >= this.endTime) {
            this.invalidate('endTime', 'End time must be after start time');
        }
    }
});

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;
