/**
 * WhitelistEntry — Records imported from Admin-uploaded Excel sheets.
 * Faculty and Students can only register if a matching entry exists here.
 */
const mongoose = require('mongoose');

const whitelistEntrySchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['FACULTY', 'STUDENT'],
        },
        contactNo: { type: String, default: null, trim: true },
        enrollmentNo: { type: String, default: null, trim: true },
        currentSem: { type: Number, default: null },
        /**
         * claimed = true once a user has registered against this entry.
         */
        claimed: {
            type: Boolean,
            default: false,
        },
        /**
         * Reference to the User record created when claimed.
         */
        claimedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        /**
         * The admin who uploaded this entry.
         */
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

whitelistEntrySchema.index({ email: 1, role: 1 }, { unique: true });
whitelistEntrySchema.index({ claimed: 1 });

const WhitelistEntry = mongoose.model('WhitelistEntry', whitelistEntrySchema);

module.exports = WhitelistEntry;
