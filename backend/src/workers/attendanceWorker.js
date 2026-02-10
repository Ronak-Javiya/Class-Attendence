/**
 * Attendance Worker — AI-powered photo processing.
 *
 * Architecture:
 *   - Sends classroom photos to Python AI service for face detection.
 *   - Receives face embeddings bac k.
 *   - Matches against enrolled student embeddings in MongoDB (cosine similarity).
 *   - Creates AttendanceRecord + AttendanceEntry documents.
 *   - Transitions lecture to LOCKED.
 *
 * Fallback:
 *   - If AI service is unavailable, marks all students ABSENT with 0 confidence.
 *   - This ensures the system doesn't silently mark students present.
 */

const Lecture = require('../models/Lecture');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceEntry = require('../models/AttendanceEntry');
const AttendancePhoto = require('../models/AttendancePhoto');
const Enrollment = require('../models/Enrollment');
const { matchClassroomFaces } = require('../services/faceService');
const logger = require('../utils/logger');

/**
 * processLectureAttendance — Main entry point for the worker.
 *
 * Steps:
 *   1. Validate lecture is in PHOTO_UPLOADED state.
 *   2. Fetch uploaded photos (evidence).
 *   3. Call faceService.matchClassroomFaces() for AI-powered matching.
 *   4. Create AttendanceRecord + AttendanceEntry documents.
 *   5. Transition lecture to ATTENDANCE_GENERATED, then LOCKED.
 *
 * Idempotent: if attendance already exists for this lecture, skip.
 */
const processLectureAttendance = async (lectureId) => {
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
        logger.error('Worker: Lecture not found', { lectureId });
        return;
    }

    // Idempotency guard — skip if already processed
    if (lecture.status === 'LOCKED' || lecture.status === 'ATTENDANCE_GENERATED') {
        logger.info('Worker: Lecture already processed, skipping', { lectureId });
        return;
    }

    if (lecture.status !== 'PHOTO_UPLOADED') {
        logger.error('Worker: Invalid lecture status for processing', {
            lectureId,
            status: lecture.status,
        });
        return;
    }

    // 1. Verify photos exist
    const photos = await AttendancePhoto.find({ lectureId });
    if (photos.length === 0) {
        logger.error('Worker: No photos found for lecture', { lectureId });
        return;
    }

    // 2. Call AI service for face matching
    let matchResults;
    try {
        // Photo storageUrls are mock paths for now.
        // In production, these would be real file paths or S3 URLs downloaded to temp.
        const photoPaths = photos.map(p => p.storageUrl);
        matchResults = await matchClassroomFaces(lecture.classId, photoPaths);
    } catch (err) {
        logger.warn('Worker: AI service unavailable, falling back to all-ABSENT', {
            lectureId,
            error: err.message,
        });

        // Fallback: Mark all enrolled students ABSENT with 0 confidence
        const enrollments = await Enrollment.find({
            classId: lecture.classId,
            status: 'APPROVED',
        });
        matchResults = enrollments.map(e => ({
            studentId: e.studentId.toString(),
            status: 'ABSENT',
            confidence: 0,
        }));
    }

    // 3. Compute aggregate confidence
    const avgConfidence = matchResults.length > 0
        ? matchResults.reduce((sum, r) => sum + r.confidence, 0) / matchResults.length
        : 0;

    // 4. Create AttendanceRecord
    const record = await AttendanceRecord.create({
        lectureId,
        classId: lecture.classId,
        generatedAt: new Date(),
        generationMethod: 'PHOTO_CLUSTER_V1',
        confidenceScore: Math.round(avgConfidence * 100) / 100,
        status: 'AUTO_LOCKED',
    });

    // 5. Create AttendanceEntry for each student
    const entries = matchResults.map((result) => ({
        attendanceRecordId: record._id,
        studentId: result.studentId,
        status: result.status,
        confidenceScore: result.confidence,
    }));

    if (entries.length > 0) {
        await AttendanceEntry.insertMany(entries);
    }

    // 6. Transition lecture: PHOTO_UPLOADED → ATTENDANCE_GENERATED → LOCKED
    lecture.status = 'ATTENDANCE_GENERATED';
    await lecture.save();
    lecture.status = 'LOCKED';
    await lecture.save();

    logger.info('Worker: Attendance generated and lecture locked', {
        lectureId,
        recordId: record._id,
        studentsProcessed: entries.length,
        presentCount: matchResults.filter(r => r.status === 'PRESENT').length,
    });

    return record;
};

module.exports = {
    processLectureAttendance,
};
