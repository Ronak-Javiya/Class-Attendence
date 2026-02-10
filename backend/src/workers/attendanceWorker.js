/**
 * Attendance Worker — Async stub for AI photo processing.
 *
 * MVP Philosophy:
 *   - This stub simulates an AI pipeline.
 *   - It receives a lectureId and processes photos.
 *   - For MVP: marks all enrolled students as PRESENT with 0.85 confidence.
 *   - Architecture allows drop-in replacement with real face recognition later.
 *
 * In production, this would be:
 *   - A separate microservice or serverless function.
 *   - Triggered via message queue (Redis, SQS, RabbitMQ).
 *   - Running GPU-accelerated face detection/recognition.
 */

const Lecture = require('../models/Lecture');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceEntry = require('../models/AttendanceEntry');
const AttendancePhoto = require('../models/AttendancePhoto');
const Enrollment = require('../models/Enrollment');
const logger = require('../utils/logger');

/**
 * processLectureAttendance — Main entry point for the worker.
 *
 * Steps:
 *   1. Validate lecture is in PHOTO_UPLOADED state.
 *   2. Fetch uploaded photos (evidence).
 *   3. Fetch approved students from Enrollment (Module 3).
 *   4. Stub AI: mark all students PRESENT.
 *   5. Create AttendanceRecord + AttendanceEntry documents.
 *   6. Transition lecture to ATTENDANCE_GENERATED, then LOCKED.
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

    // 2. Fetch approved students for this class (from Module 3)
    const enrollments = await Enrollment.find({
        classId: lecture.classId,
        status: 'APPROVED',
    });

    if (enrollments.length === 0) {
        logger.warn('Worker: No approved students for class', {
            classId: lecture.classId,
        });
    }

    // 3. Stub AI pipeline — mark all students PRESENT with mock confidence
    //    In production, this would analyze photos and match faces.
    const stubResults = enrollments.map((enrollment) => ({
        studentId: enrollment.studentId,
        status: 'PRESENT',
        confidenceScore: 0.85, // Mock confidence
    }));

    // 4. Create AttendanceRecord
    const record = await AttendanceRecord.create({
        lectureId,
        classId: lecture.classId,
        generatedAt: new Date(),
        generationMethod: 'PHOTO_CLUSTER_V1',
        confidenceScore: 0.85,
        status: 'AUTO_LOCKED',
    });

    // 5. Create AttendanceEntry for each student
    const entries = stubResults.map((result) => ({
        attendanceRecordId: record._id,
        studentId: result.studentId,
        status: result.status,
        confidenceScore: result.confidenceScore,
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
    });

    return record;
};

module.exports = {
    processLectureAttendance,
};
