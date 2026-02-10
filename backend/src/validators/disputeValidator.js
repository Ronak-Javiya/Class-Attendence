/**
 * Dispute Validator — Input validation only, no DB access.
 */

const validateCreateDispute = (body) => {
    const errors = [];

    if (!body.attendanceEntryId || typeof body.attendanceEntryId !== 'string') {
        errors.push('attendanceEntryId is required');
    }
    if (!body.reason || typeof body.reason !== 'string' || !body.reason.trim()) {
        errors.push('Reason is required');
    }

    return errors.length > 0 ? errors : null;
};

const validateResolveDispute = (body) => {
    const errors = [];

    if (!['APPROVE', 'REJECT'].includes(body.action)) {
        errors.push('Action must be APPROVE or REJECT');
    }
    if (!body.comment || typeof body.comment !== 'string' || !body.comment.trim()) {
        errors.push('Comment is required for resolution');
    }

    return errors.length > 0 ? errors : null;
};

const validateOverride = (body) => {
    const errors = [];

    if (!['PRESENT', 'ABSENT'].includes(body.newStatus)) {
        errors.push('newStatus must be PRESENT or ABSENT');
    }
    if (!body.reason || typeof body.reason !== 'string' || !body.reason.trim()) {
        errors.push('Reason is required for override');
    }

    return errors.length > 0 ? errors : null;
};

module.exports = {
    validateCreateDispute,
    validateResolveDispute,
    validateOverride,
};
