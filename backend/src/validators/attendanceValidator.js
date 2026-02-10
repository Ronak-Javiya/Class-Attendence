/**
 * Attendance Validator — Input validation only, no DB access.
 */

const validateCreateLecture = (body) => {
    const errors = [];

    if (!body.classId || typeof body.classId !== 'string') {
        errors.push('classId is required');
    }
    if (!body.timetableSlotId || typeof body.timetableSlotId !== 'string') {
        errors.push('timetableSlotId is required');
    }

    return errors.length > 0 ? errors : null;
};

module.exports = {
    validateCreateLecture,
};
