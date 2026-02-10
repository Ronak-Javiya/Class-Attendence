const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ROLES = ['HOD', 'ADMIN', 'FACULTY', 'STUDENT'];
const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
            maxlength: [100, 'Full name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
            select: false, // Never returned in queries by default
        },
        role: {
            type: String,
            required: [true, 'Role is required'],
            enum: {
                values: ROLES,
                message: 'Role must be one of: HOD, ADMIN, FACULTY, STUDENT',
            },
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            // References a Department collection in a future module
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        refreshTokenHash: {
            type: String,
            default: null,
            select: false, // Never returned in queries by default
        },
    },
    {
        timestamps: true, // Adds createdAt, updatedAt
    }
);

// -------------------------------------------------------
// Indexes
// -------------------------------------------------------
userSchema.index({ role: 1 });

// -------------------------------------------------------
// Instance Methods
// -------------------------------------------------------

/**
 * Compares a plaintext password against the stored hash.
 * The passwordHash field must be explicitly selected before calling this.
 */
userSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.passwordHash);
};

// -------------------------------------------------------
// Statics
// -------------------------------------------------------

/**
 * Hashes a plaintext password for storage.
 */
userSchema.statics.hashPassword = async function (plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

/**
 * Valid roles constant exposed for external use.
 */
userSchema.statics.ROLES = ROLES;

const User = mongoose.model('User', userSchema);

module.exports = User;
