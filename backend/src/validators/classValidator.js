/**
 * Request validators for Academic Structure APIs.
 * Returns an error message string if invalid, or null if valid.
 * Kept simple and dependency-free (no Joi) for MVP.
 */

const validateCreateClass = (body) => {
    const errors = [];

    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
        errors.push('title is required');
    }
    if (!body.classCode || typeof body.classCode !== 'string' || !body.classCode.trim()) {
        errors.push('classCode is required');
    }
    if (!body.departmentId) {
        errors.push('departmentId is required');
    }
    if (body.semester === undefined || body.semester === null) {
        errors.push('semester is required');
    } else if (!Number.isInteger(body.semester) || body.semester < 1 || body.semester > 12) {
        errors.push('semester must be an integer between 1 and 12');
    }
    if (!body.section || typeof body.section !== 'string' || !body.section.trim()) {
        errors.push('section is required');
    }

    return errors.length > 0 ? errors : null;
};

const validateTimetableSlot = (body) => {
    const errors = [];
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (body.dayOfWeek === undefined || body.dayOfWeek === null) {
        errors.push('dayOfWeek is required');
    } else if (!Number.isInteger(body.dayOfWeek) || body.dayOfWeek < 0 || body.dayOfWeek > 6) {
        errors.push('dayOfWeek must be an integer between 0 (Sunday) and 6 (Saturday)');
    }
    if (!body.startTime || !timeRegex.test(body.startTime)) {
        errors.push('startTime is required in HH:mm format (24-hour)');
    }
    if (!body.endTime || !timeRegex.test(body.endTime)) {
        errors.push('endTime is required in HH:mm format (24-hour)');
    }
    if (body.startTime && body.endTime && body.startTime >= body.endTime) {
        errors.push('endTime must be after startTime');
    }

    return errors.length > 0 ? errors : null;
};

const validateCreateDepartment = (body) => {
    const errors = [];

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
        errors.push('name is required');
    }
    if (!body.code || typeof body.code !== 'string' || !body.code.trim()) {
        errors.push('code is required');
    }

    return errors.length > 0 ? errors : null;
};

module.exports = {
    validateCreateClass,
    validateTimetableSlot,
    validateCreateDepartment,
};
