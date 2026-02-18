/**
 * Registration Service — Business logic for all registration flows.
 *
 * Flows:
 *  1. HoD   — Self-register with domain-validated email.
 *  2. Admin — Self-register, but isApproved = false until HoD approves.
 *  3. Faculty/Student — Claim a pre-seeded WhitelistEntry by setting a password.
 *  4. Bulk upload — Admin uploads Excel → WhitelistEntry records created.
 */
const User = require('../models/User');
const WhitelistEntry = require('../models/WhitelistEntry');
const logger = require('../utils/logger');
const XLSX = require('xlsx');

// -------------------------------------------------------
// Allowed HoD email domains (configurable)
// -------------------------------------------------------
const HOD_EMAIL_DOMAINS = ['college.edu', 'university.edu'];

// -------------------------------------------------------
// 1. HoD Registration
// -------------------------------------------------------
const registerHoD = async ({ fullName, email, password }) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!HOD_EMAIL_DOMAINS.includes(domain)) {
        const err = new Error(`HoD registration requires an institutional email (${HOD_EMAIL_DOMAINS.join(', ')})`);
        err.statusCode = 400;
        throw err;
    }

    const existing = await User.findOne({ email });
    if (existing) {
        const err = new Error('An account with this email already exists');
        err.statusCode = 409;
        throw err;
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
        fullName,
        email,
        passwordHash,
        role: 'HOD',
        isApproved: true,
        registrationStatus: 'ACTIVE',
    });

    logger.info('HoD registered', { userId: user._id, email });
    return { userId: user._id, fullName: user.fullName, role: user.role };
};

// -------------------------------------------------------
// 2. Admin Registration (pending HoD approval)
// -------------------------------------------------------
const registerAdmin = async ({ fullName, email, password }) => {
    const existing = await User.findOne({ email });
    if (existing) {
        const err = new Error('An account with this email already exists');
        err.statusCode = 409;
        throw err;
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
        fullName,
        email,
        passwordHash,
        role: 'ADMIN',
        isApproved: false,          // <-- requires HoD approval
        registrationStatus: 'ACTIVE',
    });

    logger.info('Admin registered (pending approval)', { userId: user._id, email });
    return { userId: user._id, fullName: user.fullName, role: user.role, isApproved: false };
};

// -------------------------------------------------------
// 3. HoD approves / rejects Admin
// -------------------------------------------------------
const approveAdmin = async (adminUserId, approve = true) => {
    const admin = await User.findById(adminUserId);
    if (!admin || admin.role !== 'ADMIN') {
        const err = new Error('Admin user not found');
        err.statusCode = 404;
        throw err;
    }

    if (approve) {
        admin.isApproved = true;
        await admin.save();
        logger.info('Admin approved', { userId: admin._id });
        return { message: 'Admin approved successfully', userId: admin._id };
    } else {
        // Rejection — deactivate the account
        admin.isActive = false;
        await admin.save();
        logger.info('Admin rejected', { userId: admin._id });
        return { message: 'Admin registration rejected', userId: admin._id };
    }
};

// -------------------------------------------------------
// 4. Get pending Admin registrations (for HoD dashboard)
// -------------------------------------------------------
const getPendingAdmins = async () => {
    return User.find({ role: 'ADMIN', isApproved: false, isActive: true })
        .select('fullName email createdAt')
        .sort({ createdAt: -1 });
};

// -------------------------------------------------------
// 5. Bulk upload Faculty/Student from Excel
// -------------------------------------------------------
const bulkUploadFromExcel = async (fileBuffer, role, uploadedBy) => {
    if (!['FACULTY', 'STUDENT'].includes(role)) {
        const err = new Error('Bulk upload is only for FACULTY or STUDENT roles');
        err.statusCode = 400;
        throw err;
    }

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!rows.length) {
        const err = new Error('Excel file is empty or has no recognizable data');
        err.statusCode = 400;
        throw err;
    }

    const results = { created: 0, skipped: 0, errors: [] };

    for (const row of rows) {
        // Normalize column names (case-insensitive)
        const norm = {};
        for (const [key, val] of Object.entries(row)) {
            norm[key.toLowerCase().trim()] = val;
        }

        const fullName = norm['name'] || norm['full name'] || norm['fullname'];
        const email = norm['email'] || norm['email id'];
        const contactNo = norm['contact no.'] || norm['contact no'] || norm['contact'] || norm['phone'] || null;
        const enrollmentNo = norm['enrollment no.'] || norm['enrollment no'] || norm['enrollment'] || null;
        const currentSem = norm['current sem'] || norm['semester'] || norm['sem'] || null;

        if (!fullName || !email) {
            results.errors.push(`Row skipped — missing name or email: ${JSON.stringify(row)}`);
            results.skipped++;
            continue;
        }

        try {
            await WhitelistEntry.create({
                fullName: String(fullName).trim(),
                email: String(email).toLowerCase().trim(),
                role,
                contactNo: contactNo ? String(contactNo).trim() : null,
                enrollmentNo: enrollmentNo ? String(enrollmentNo).trim() : null,
                currentSem: currentSem ? Number(currentSem) : null,
                uploadedBy,
            });
            results.created++;
        } catch (dupErr) {
            if (dupErr.code === 11000) {
                results.errors.push(`Duplicate entry skipped: ${email}`);
                results.skipped++;
            } else {
                results.errors.push(`Error for ${email}: ${dupErr.message}`);
                results.skipped++;
            }
        }
    }

    logger.info('Bulk upload completed', { role, ...results });
    return results;
};

// -------------------------------------------------------
// 6. Faculty / Student claim account
// -------------------------------------------------------
const claimAccount = async ({ email, password, role }) => {
    if (!['FACULTY', 'STUDENT'].includes(role)) {
        const err = new Error('Claim is only available for FACULTY or STUDENT');
        err.statusCode = 400;
        throw err;
    }

    // Check whitelist
    const entry = await WhitelistEntry.findOne({ email: email.toLowerCase().trim(), role, claimed: false });
    if (!entry) {
        const err = new Error('Your email is not on the approved list, or has already been claimed. Contact your Admin.');
        err.statusCode = 404;
        throw err;
    }

    // Check if a User already exists with this email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
        const err = new Error('An account with this email already exists');
        err.statusCode = 409;
        throw err;
    }

    // Create user
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
        fullName: entry.fullName,
        email: entry.email,
        passwordHash,
        role,
        isApproved: true,
        registrationStatus: 'ACTIVE',
        contactNo: entry.contactNo,
        enrollmentNo: entry.enrollmentNo,
        currentSem: entry.currentSem,
    });

    // Mark whitelist entry as claimed
    entry.claimed = true;
    entry.claimedBy = user._id;
    await entry.save();

    logger.info('Account claimed', { userId: user._id, email, role });
    return { userId: user._id, fullName: user.fullName, role: user.role };
};

// -------------------------------------------------------
// 7. Check if email is whitelisted (for frontend pre-check)
// -------------------------------------------------------
const checkWhitelist = async (email, role) => {
    const entry = await WhitelistEntry.findOne({ email: email.toLowerCase().trim(), role, claimed: false });
    return { whitelisted: !!entry, fullName: entry?.fullName || null };
};

module.exports = {
    registerHoD,
    registerAdmin,
    approveAdmin,
    getPendingAdmins,
    bulkUploadFromExcel,
    claimAccount,
    checkWhitelist,
};
