const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { enrollStudentFace } = require('../services/faceService');
const requireAuth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// -------------------------------------------------------
// Multer config: store temporarily in uploads/
// -------------------------------------------------------
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'faces');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per image
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only .jpg, .jpeg, .png images are allowed'));
        }
    },
});

// -------------------------------------------------------
// POST /api/face/enroll — Student uploads 3+ face photos
// -------------------------------------------------------
router.post(
    '/enroll',
    requireAuth,
    requireRole(['STUDENT']),
    upload.array('images', 10), // Max 10 images
    async (req, res, next) => {
        try {
            if (!req.files || req.files.length < 3) {
                // Clean up any uploaded files
                if (req.files) {
                    req.files.forEach(f => fs.unlinkSync(f.path));
                }
                return res.status(400).json({
                    success: false,
                    message: 'At least 3 face images are required.',
                });
            }

            const imagePaths = req.files.map(f => f.path);

            const result = await enrollStudentFace(req.user.userId, imagePaths);

            // Clean up uploaded files after processing
            req.files.forEach(f => {
                try { fs.unlinkSync(f.path); } catch (e) { /* ignore */ }
            });

            res.status(200).json({
                success: true,
                message: result.message,
                data: { imagesUsed: result.imagesUsed },
            });
        } catch (error) {
            // Clean up on error too
            if (req.files) {
                req.files.forEach(f => {
                    try { fs.unlinkSync(f.path); } catch (e) { /* ignore */ }
                });
            }
            next(error);
        }
    }
);

module.exports = router;
