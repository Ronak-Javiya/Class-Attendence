/**
 * Enrollment Validator
 *
 * Input validation only — no DB access.
 */

const validateEnrollmentRequest = (body) => {
    const errors = [];

    if (!body.classId || typeof body.classId !== 'string') {
        errors.push('classId is required and must be a string');
    }

    return errors.length > 0 ? errors : null;
};

const validateRejection = (body) => {
    const errors = [];

    if (!body.rejectionReason || typeof body.rejectionReason !== 'string' || !body.rejectionReason.trim()) {
        errors.push('rejectionReason is required');
    }

    return errors.length > 0 ? errors : null;
};

module.exports = {
    validateEnrollmentRequest,
    validateRejection,
};
