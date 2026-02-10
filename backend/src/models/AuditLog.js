const mongoose = require('mongoose');

/**
 * AuditLog — Immutable, append-only record of all critical actions.
 *
 * Tracks: DISPUTE_RAISED, DISPUTE_RESULT, ADMIN_OVERRIDE.
 * Never updated, never deleted.
 */
const auditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            enum: ['DISPUTE_RAISED', 'DISPUTE_RESULT', 'ADMIN_OVERRIDE'],
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        performedByRole: {
            type: String,
            required: true,
        },
        entityType: {
            type: String,
            required: true,
            enum: ['AttendanceDispute', 'AttendanceOverride'],
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        payload: {
            type: mongoose.Schema.Types.Mixed, // Stores snapshot or diff details
            default: {},
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        // No timestamps needed since `timestamp` field covers creation time
        timestamps: false,
        versionKey: false, // Audit logs are never updated
    }
);

// -------------------------------------------------------
// Indexes
// -------------------------------------------------------
auditLogSchema.index({ entityId: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
