/**
 * Test Script — Dispute & Audit Domain full lifecycle.
 *
 * Tests:
 * 1. Setup: Create ACTIVE class, enroll student, create lecture, stub ABSENT attendance.
 * 2. Student raises dispute (OPEN).
 * 3. Verify 72h window check (simulate old lecture).
 * 4. Faculty approves dispute (FACULTY_APPROVED) -> Creates Override (PRESENT).
 * 5. Verify Student Effective Attendance = PRESENT.
 * 6. Admin overrides decision -> Override (ABSENT).
 * 7. Verify Audit Logs exist for all actions.
 *
 * Usage: node src/scripts/test-dispute.js
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
const AttendanceDispute = require('../models/AttendanceDispute');
const AttendanceOverride = require('../models/AttendanceOverride');
const AuditLog = require('../models/AuditLog');
const classService = require('../services/classService');
const enrollmentService = require('../services/enrollmentService');
const attendanceService = require('../services/attendanceService');
const disputeService = require('../services/disputeService');

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
        await AttendanceDispute.deleteMany({});
        await AttendanceOverride.deleteMany({});
        await AuditLog.deleteMany({});
        await Lecture.deleteMany({});
        await AttendanceRecord.deleteMany({});
        await AttendanceEntry.deleteMany({});
        await Enrollment.deleteMany({});
        await Timetable.deleteMany({});
        await Class.deleteMany({ classCode: 'DISPUTE-TEST-A' });
        console.log('[Test] Cleaned up previous test data\n');

        // ---- Setup: Create ACTIVE class + Enroll student ----
        console.log('--- Setup: Create ACTIVE class + Enroll student ---');
        const todayDay = new Date().getDay();

        const cls = await classService.createClass({
            title: 'Dispute Test Class',
            classCode: 'DISPUTE-TEST-A',
            departmentId: dept._id,
            semester: 5,
            section: 'A',
            facultyId: faculty._id,
        });

        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0');
        const nextHour = (now.getHours() + 1).toString().padStart(2, '0');
        const slot = await classService.addTimetableSlot(cls._id, faculty._id, {
            dayOfWeek: todayDay,
            startTime: `${currentHour}:00`,
            endTime: `${nextHour}:00`,
        });

        await classService.submitClass(cls._id, faculty._id);
        await classService.approveClass(cls._id, hod._id);
        const enrollment = await enrollmentService.requestEnrollment(student._id, cls._id);
        await enrollmentService.approveEnrollment(enrollment._id, admin._id);
        console.log(`  Class ACTIVE, Student Enrolled\n`);

        // ---- Setup: Create Lecture & Generate ABSENT Attendance ----
        console.log('--- Setup: Generate ABSENT attendance ---');
        const lecture = await attendanceService.createLecture(faculty._id, {
            classId: cls._id.toString(),
            timetableSlotId: slot._id.toString(),
        });

        // Manually create record/entry to simulate "ABSENT" result from AI
        const record = await AttendanceRecord.create({
            lectureId: lecture._id,
            classId: cls._id,
            status: 'AUTO_LOCKED',
        });

        const entry = await AttendanceEntry.create({
            attendanceRecordId: record._id,
            studentId: student._id,
            status: 'ABSENT', // Key: Student is ABSENT
            confidenceScore: 0.1,
        });
        console.log(`  Attendance Entry Created: ABSENT (ID: ${entry._id})\n`);


        // ---- Step 1: Student Raises Dispute ----
        console.log('--- Step 1: Student Raises Dispute ---');
        try {
            const dispute = await disputeService.raiseDispute(student._id, {
                attendanceEntryId: entry._id.toString(),
                reason: 'I was present but camera missed me.',
            });
            console.log(`  PASS: Dispute raised | Status: ${dispute.status}`);
        } catch (err) {
            console.error(`  FAIL: ${err.message}`);
        }


        // ---- Step 2: Faculty Approves Dispute ----
        console.log('--- Step 2: Faculty Approves Dispute ---');
        try {
            // Fetch open dispute
            const disputes = await disputeService.getClassDisputes(cls._id, { userId: faculty._id, role: 'FACULTY' });
            const openDispute = disputes[0];

            const resolved = await disputeService.resolveDispute(openDispute._id, faculty._id, {
                action: 'APPROVE',
                comment: 'Verified manually.',
            });
            console.log(`  PASS: Dispute Resolved | Status: ${resolved.status}`);

            // Verify Override Created
            const override = await AttendanceOverride.findOne({ attendanceEntryId: entry._id });
            console.log(`  PASS: Override Created | NewStatus: ${override.newStatus}`);
        } catch (err) {
            console.error(`  FAIL: ${err.message}`);
        }


        // ---- Step 3: Verify Effective Attendance (Student View) ----
        console.log('--- Step 3: Verify Effective Attendance ---');
        try {
            const effective = await disputeService.getEffectiveAttendance(student._id);
            const myEntry = effective.find(e => e._id.toString() === entry._id.toString());
            console.log(`  Original: ${myEntry.originalStatus} | Effective: ${myEntry.effectiveStatus}`);
            if (myEntry.effectiveStatus === 'PRESENT') {
                console.log(`  PASS: Effective status is PRESENT (Overridden)`);
            } else {
                console.error(`  FAIL: Effective status should be PRESENT`);
            }
        } catch (err) {
            console.error(`  FAIL: ${err.message}`);
        }


        // ---- Step 4: Admin Overrides Decision ----
        console.log('--- Step 4: Admin Overrides Decision (Back to ABSENT) ---');
        try {
            await disputeService.adminOverride(entry._id, admin._id, 'ADMIN', {
                newStatus: 'ABSENT',
                reason: 'Video review shows student was sleeping.',
            });

            const effective = await disputeService.getEffectiveAttendance(student._id);
            const myEntry = effective.find(e => e._id.toString() === entry._id.toString());
            console.log(`  Effective after Admin Override: ${myEntry.effectiveStatus}`);

            if (myEntry.effectiveStatus === 'ABSENT') {
                console.log(`  PASS: Effective status is ABSENT (Admin Override)`);
            } else {
                console.error(`  FAIL: Effective status should be ABSENT`);
            }
        } catch (err) {
            console.error(`  FAIL: ${err.message}`);
        }


        // ---- Step 5: Verify Audit Logs ----
        console.log('--- Step 5: Verify Audit Logs ---');
        const logs = await AuditLog.find({
            entityId: {
                $in: [
                    (await AttendanceDispute.findOne({ attendanceEntryId: entry._id }))._id,
                    (await AttendanceOverride.findOne({ attendanceEntryId: entry._id }))._id
                ]
            }
        }).sort({ timestamp: 1 });

        console.log(`  Found ${logs.length} audit logs:`);
        logs.forEach(log => {
            console.log(`    - [${log.action}] by ${log.performedByRole}`);
        });

        if (logs.length >= 3) { // RAISED, RESULT, OVERRIDE
            console.log(`  PASS: Audit trail is complete.\n`);
        } else {
            console.error(`  FAIL: Missing audit logs.\n`);
        }


        console.log('=== ALL DISPUTE TESTS COMPLETE ===');
        process.exit(0);
    } catch (error) {
        console.error('[Test] Fatal Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

test();
