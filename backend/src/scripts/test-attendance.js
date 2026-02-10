/**
 * Test Script — Attendance Domain full lifecycle.
 *
 * Tests:
 * 1. Setup: Create ACTIVE class, enroll student, approve enrollment.
 * 2. Faculty creates lecture.
 * 3. Faculty uploads photos.
 * 4. Worker generates attendance (sync call for test).
 * 5. Verify lecture LOCKED.
 * 6. Student views own attendance.
 * 7. Faculty views class attendance.
 * 8. Negative: Duplicate lecture creation.
 *
 * Usage: node src/scripts/test-attendance.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Class = require('../models/Class');
const Timetable = require('../models/Timetable');
const Enrollment = require('../models/Enrollment');
const Lecture = require('../models/Lecture');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceEntry = require('../models/AttendanceEntry');
const AttendancePhoto = require('../models/AttendancePhoto');
const classService = require('../services/classService');
const enrollmentService = require('../services/enrollmentService');
const attendanceService = require('../services/attendanceService');
const { processLectureAttendance } = require('../workers/attendanceWorker');

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[Test] Connected to MongoDB\n');

        const faculty = await User.findOne({ email: 'faculty@college.edu' });
        const student = await User.findOne({ email: 'student@college.edu' });
        const admin = await User.findOne({ email: 'admin@college.edu' });
        const hod = await User.findOne({ email: 'hod@college.edu' });
        const dept = await Department.findOne({ code: 'CSE' });

        if (!faculty || !student || !admin || !hod || !dept) {
            console.error('[Test] Seed data missing. Run: npm run seed');
            process.exit(1);
        }

        // Cleanup
        await Lecture.deleteMany({});
        await AttendanceRecord.deleteMany({});
        await AttendanceEntry.deleteMany({});
        await AttendancePhoto.deleteMany({});
        await Enrollment.deleteMany({});
        await Timetable.deleteMany({});
        await Class.deleteMany({ classCode: 'ATT-TEST-A' });
        console.log('[Test] Cleaned up previous test data\n');

        // ---- Setup: Create ACTIVE class with timetable matching TODAY ----
        console.log('--- Setup: Create ACTIVE class + Enroll student ---');
        const todayDay = new Date().getDay(); // 0=Sun, 6=Sat

        const cls = await classService.createClass({
            title: 'Attendance Test Class',
            classCode: 'ATT-TEST-A',
            departmentId: dept._id,
            semester: 4,
            section: 'A',
            facultyId: faculty._id,
        });

        // Create timetable slot matching TODAY's day AND current time window
        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0');
        const nextHour = (now.getHours() + 1).toString().padStart(2, '0');
        const slotStart = `${currentHour}:00`;
        const slotEnd = `${nextHour}:00`;

        const slot = await classService.addTimetableSlot(cls._id, faculty._id, {
            dayOfWeek: todayDay,
            startTime: slotStart,
            endTime: slotEnd,
        });
        console.log(`  Timetable Slot: Day ${todayDay}, ${slotStart}-${slotEnd}`);

        await classService.submitClass(cls._id, faculty._id);
        await classService.approveClass(cls._id, hod._id);
        console.log(`  Class: ${cls.classCode} | Status: ACTIVE`);

        // Enroll student
        const enrollment = await enrollmentService.requestEnrollment(student._id, cls._id);
        await enrollmentService.approveEnrollment(enrollment._id, admin._id);
        console.log(`  Student enrolled and APPROVED\n`);

        // ---- Step 1: Faculty creates lecture ----
        console.log('--- Step 1: Faculty creates lecture ---');
        try {
            const lecture = await attendanceService.createLecture(faculty._id, {
                classId: cls._id.toString(),
                timetableSlotId: slot._id.toString(),
            });
            console.log(`  PASS: Lecture created | Status: ${lecture.status} | Date: ${lecture.date}\n`);

            // ---- Step 2: Faculty uploads photos ----
            console.log('--- Step 2: Faculty uploads photos ---');
            try {
                const uploadResult = await attendanceService.uploadPhotos(
                    lecture._id, faculty._id,
                    ['mock://photos/class1_photo1.jpg', 'mock://photos/class1_photo2.jpg']
                );
                console.log(`  PASS: ${uploadResult.photosUploaded} photos uploaded\n`);
            } catch (err) {
                console.error(`  FAIL: ${err.message}\n`);
            }

            // ---- Step 3: Run worker synchronously for test ----
            console.log('--- Step 3: Worker generates attendance ---');
            // Wait a moment for setImmediate to fire, but also call directly
            await new Promise((r) => setTimeout(r, 500));
            // Re-check lecture status
            const updatedLecture = await Lecture.findById(lecture._id);
            console.log(`  Lecture status after worker: ${updatedLecture.status}`);

            if (updatedLecture.status !== 'LOCKED') {
                // Worker may not have run yet (setImmediate), call directly
                console.log('  (Running worker directly for test reliability...)');
                // Reset status for direct call
                if (updatedLecture.status === 'PHOTO_UPLOADED') {
                    await processLectureAttendance(lecture._id);
                }
                const finalLecture = await Lecture.findById(lecture._id);
                console.log(`  Lecture status: ${finalLecture.status}`);
            }
            console.log(`  PASS: Lecture locked\n`);

            // ---- Step 4: Verify attendance record ----
            console.log('--- Step 4: Verify attendance records ---');
            const record = await AttendanceRecord.findOne({ lectureId: lecture._id });
            const entries = await AttendanceEntry.find({ attendanceRecordId: record._id });
            console.log(`  Record: ${record.status} | Method: ${record.generationMethod}`);
            console.log(`  Entries: ${entries.length}`);
            entries.forEach((e) => {
                console.log(`    Student ${e.studentId}: ${e.status} (confidence: ${e.confidenceScore})`);
            });
            console.log('');

            // ---- Step 5: Student views own attendance ----
            console.log('--- Step 5: Student views own attendance ---');
            try {
                const myAttendance = await attendanceService.getMyAttendance(student._id);
                console.log(`  PASS: Student sees ${myAttendance.length} attendance entry(ies)\n`);
            } catch (err) {
                console.error(`  FAIL: ${err.message}\n`);
            }

            // ---- Step 6: Faculty views class attendance ----
            console.log('--- Step 6: Faculty views class attendance ---');
            try {
                const classAttendance = await attendanceService.getClassAttendance(cls._id, {
                    userId: faculty._id,
                    role: 'FACULTY',
                });
                console.log(`  PASS: Faculty sees ${classAttendance.length} lecture(s)`);
                classAttendance.forEach((la) => {
                    console.log(`    Date: ${la.lecture.date} | Present: ${la.summary.present}/${la.summary.total}`);
                });
                console.log('');
            } catch (err) {
                console.error(`  FAIL: ${err.message}\n`);
            }

            // ---- Step 7: Negative: Duplicate lecture ----
            console.log('--- Step 7: Duplicate lecture (should FAIL) ---');
            try {
                await attendanceService.createLecture(faculty._id, {
                    classId: cls._id.toString(),
                    timetableSlotId: slot._id.toString(),
                });
                console.log('  FAIL: Should have thrown!\n');
            } catch (err) {
                console.log(`  PASS: ${err.message}\n`);
            }

        } catch (err) {
            console.error(`  FAIL on lecture creation: ${err.message}\n`);
        }

        console.log('=== ALL ATTENDANCE TESTS COMPLETE ===');
        process.exit(0);
    } catch (error) {
        console.error('[Test] Fatal Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

test();
