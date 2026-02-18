/**
 * Registration Controller — HTTP handler for registration flows.
 */
const registrationService = require('../services/registrationService');
const multer = require('multer');

// Multer configured for in-memory buffer (Excel files)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// -------------------------------------------------------
// POST /register/hod
// -------------------------------------------------------
const registerHoD = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: 'fullName, email, and password are required' });
        }
        const result = await registrationService.registerHoD({ fullName, email, password });
        res.status(201).json({ success: true, message: 'HoD registered successfully', data: result });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// POST /register/admin
// -------------------------------------------------------
const registerAdmin = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: 'fullName, email, and password are required' });
        }
        const result = await registrationService.registerAdmin({ fullName, email, password });
        res.status(201).json({ success: true, message: 'Admin registered. Awaiting HoD approval.', data: result });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// POST /register/claim  (Faculty / Student)
// -------------------------------------------------------
const claimAccount = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ success: false, message: 'email, password, and role are required' });
        }
        const result = await registrationService.claimAccount({ email, password, role });
        res.status(201).json({ success: true, message: 'Account activated successfully', data: result });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// GET /register/check-whitelist?email=...&role=...
// -------------------------------------------------------
const checkWhitelist = async (req, res, next) => {
    try {
        const { email, role } = req.query;
        if (!email || !role) {
            return res.status(400).json({ success: false, message: 'email and role query params are required' });
        }
        const result = await registrationService.checkWhitelist(email, role);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// POST /register/bulk-upload  (Admin-only, protected)
// -------------------------------------------------------
const bulkUpload = [
    upload.single('file'),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Excel file is required (field name: "file")' });
            }
            const role = req.body.role; // 'FACULTY' or 'STUDENT'
            if (!role || !['FACULTY', 'STUDENT'].includes(role)) {
                return res.status(400).json({ success: false, message: 'role must be FACULTY or STUDENT' });
            }
            const result = await registrationService.bulkUploadFromExcel(req.file.buffer, role, req.user.userId);
            res.status(200).json({ success: true, message: 'Bulk upload processed', data: result });
        } catch (error) {
            next(error);
        }
    },
];

// -------------------------------------------------------
// PATCH /register/approve/:adminUserId  (HoD-only)
// -------------------------------------------------------
const approveAdmin = async (req, res, next) => {
    try {
        const { approve } = req.body; // true or false
        const result = await registrationService.approveAdmin(req.params.adminUserId, approve !== false);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// GET /register/pending-admins  (HoD-only)
// -------------------------------------------------------
const getPendingAdmins = async (req, res, next) => {
    try {
        const admins = await registrationService.getPendingAdmins();
        res.status(200).json({ success: true, data: admins });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerHoD,
    registerAdmin,
    claimAccount,
    checkWhitelist,
    bulkUpload,
    approveAdmin,
    getPendingAdmins,
};
