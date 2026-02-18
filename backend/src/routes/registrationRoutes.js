/**
 * Registration Routes
 *
 *  Public:
 *    POST /register/hod          — HoD self-registration
 *    POST /register/admin        — Admin self-registration (pending approval)
 *    POST /register/claim        — Faculty/Student claim whitelisted account
 *    GET  /register/check-whitelist?email=...&role=...  — Pre-check
 *
 *  Protected:
 *    POST  /register/bulk-upload          — Admin uploads Excel
 *    PATCH /register/approve/:adminUserId — HoD approves/rejects Admin
 *    GET   /register/pending-admins       — HoD views pending Admins
 */
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/registrationController');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// ---- Public registration routes ----
router.post('/hod', ctrl.registerHoD);
router.post('/admin', ctrl.registerAdmin);
router.post('/claim', ctrl.claimAccount);
router.get('/check-whitelist', ctrl.checkWhitelist);

// ---- Protected routes ----
router.post('/bulk-upload', requireAuth, requireRole(['ADMIN']), ctrl.bulkUpload);
router.patch('/approve/:adminUserId', requireAuth, requireRole(['HOD']), ctrl.approveAdmin);
router.get('/pending-admins', requireAuth, requireRole(['HOD']), ctrl.getPendingAdmins);

module.exports = router;
