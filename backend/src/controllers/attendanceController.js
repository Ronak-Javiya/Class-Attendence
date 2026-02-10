const attendanceService = require('../services/attendanceService');
const { validateCreateLecture } = require('../validators/attendanceValidator');

// -------------------------------------------------------
// Faculty: Create Lecture
// -------------------------------------------------------
const createLecture = async (req, res, next) => {
    try {
        const errors = validateCreateLecture(req.body);
        if (errors) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        const lecture = await attendanceService.createLecture(req.user.userId, req.body);
        res.status(201).json({ success: true, message: 'Lecture created', data: lecture });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Faculty: Upload Photos
// -------------------------------------------------------
const uploadPhotos = async (req, res, next) => {
    try {
        // For MVP: accept storageUrls in body (no multipart).
        // In production: use multer + cloud storage, then pass URLs here.
        const { storageUrls } = req.body;

        if (!storageUrls || !Array.isArray(storageUrls) || storageUrls.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'storageUrls is required (array of at least 1 URL)',
            });
        }

        const result = await attendanceService.uploadPhotos(req.params.id, req.user.userId, storageUrls);
        res.status(200).json({
            success: true,
            message: 'Photos uploaded. Attendance generation triggered.',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Student: View My Attendance
// -------------------------------------------------------
const getMyAttendance = async (req, res, next) => {
    try {
        const entries = await attendanceService.getMyAttendance(req.user.userId);
        res.status(200).json({ success: true, data: entries });
    } catch (error) {
        next(error);
    }
};

// -------------------------------------------------------
// Faculty/Admin/HOD: View Class Attendance
// -------------------------------------------------------
const getClassAttendance = async (req, res, next) => {
    try {
        const result = await attendanceService.getClassAttendance(req.params.classId, req.user);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createLecture,
    uploadPhotos,
    getMyAttendance,
    getClassAttendance,
};
