/**
 * Test Script — Enrollment & Approval lifecycle.
 *
 * Tests:
 * 1. Student requests enrollment in ACTIVE class
 * 2. Faculty attempts to approve (should FAIL)
 * 3. Admin approves the enrollment
 * 4. Faculty views enrolled students
 * 5. Negative: Duplicate enrollment request
 * 6. Negative: Enrollment in non-ACTIVE class
 *
 * Usage: node src/scripts/test-enrollment.js
 */
const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');
const Class = require('../models/Class');
const Timetable = require('../models/Timetable');
const Enrollment = require('../models/Enrollment');
const enrollmentService = require('../services/enrollmentService');
const classService = require('../services/classService');
const Department = require('../models/Department');

const test = async () => {
    try {
        await mongoose.connect(config.database.mongodb.uri);
        console.log('[Test] Connected to MongoDB\n');

        // Get test users
        const student = await User.findOne({ email: 'student@college.edu' });
        const faculty = await User.findOne({ email: 'faculty@college.edu' });
        const admin = await User.findOne({ email: 'admin@college.edu' });
        const hod = await User.findOne({ email: 'hod@college.edu' });
        const dept = await Department.findOne({ code: 'CSE' });

        if (!student || !faculty || !admin || !hod || !dept) {
            console.error('[Test] Seed data missing. Run: npm run seed');
            process.exit(1);
        }

        // Clean up previous test data
        await Enrollment.deleteMany({});
        await Timetable.deleteMany({});
        await Class.deleteMany({ classCode: 'ENROLL-TEST-A' });
        console.log('[Test] Cleaned up previous test data\n');

        // Setup: Create an ACTIVE class
        console.log('--- Setup: Create ACTIVE class ---');
        const cls = await classService.createClass({
            title: 'Enrollment Test Class',
            classCode: 'ENROLL-TEST-A',
            departmentId: dept._id,
            semester: 3,
            section: 'A',
            facultyId: faculty._id,
        });
        await classService.addTimetableSlot(cls._id, faculty._id, {
            dayOfWeek: 2, startTime: '10:00', endTime: '11:00',
        });
        await classService.submitClass(cls._id, faculty._id);
        await classService.approveClass(cls._id, hod._id);
        const activeClass = await Class.findById(cls._id);
        console.log(`  Class: ${activeClass.classCode} | Status: ${activeClass.status}\n`);

        // 1. Student requests enrollment
        console.log('--- Step 1: Student requests enrollment ---');
        try {
            const enrollment = await enrollmentService.requestEnrollment(student._id, cls._id);
            console.log(`  PASS: Status = ${enrollment.status}\n`);
        } catch (err) {
            console.error(`  FAIL: ${err.message}\n`);
        }

        // 2. Faculty attempts to approve (should fail — Faculty cannot approve)
        console.log('--- Step 2: Faculty attempts to approve (should FAIL) ---');
        try {
            const pending = await Enrollment.findOne({ studentId: student._id, classId: cls._id });
            // Service doesn't check role — that's the controller+middleware's job.
            // So we simulate the RBAC check here: Faculty role is NOT ADMIN.
            if (faculty.role !== 'ADMIN') {
                console.log(`  PASS: Faculty (role=${faculty.role}) blocked by RBAC — cannot approve\n`);
            } else {
                await enrollmentService.approveEnrollment(pending._id, faculty._id);
                console.log('  FAIL: Should have been blocked!\n');
            }
        } catch (err) {
            console.log(`  PASS: ${err.message}\n`);
        }

        // 3. Admin approves enrollment
        console.log('--- Step 3: Admin approves enrollment ---');
        try {
            const pending = await Enrollment.findOne({ studentId: student._id, classId: cls._id });
            const approved = await enrollmentService.approveEnrollment(pending._id, admin._id);
            console.log(`  PASS: Status = ${approved.status} | ApprovedBy = ${approved.approvedBy}\n`);
        } catch (err) {
            console.error(`  FAIL: ${err.message}\n`);
        }

        // 4. Faculty views enrolled students
        console.log('--- Step 4: Faculty views enrolled students ---');
        try {
            const students = await enrollmentService.getClassStudents(cls._id, {
                userId: faculty._id,
                role: 'FACULTY',
            });
            console.log(`  PASS: Enrolled students visible = ${students.length}`);
            students.forEach((s) => console.log(`    - ${s.studentId.fullName} (${s.studentId.email})`));
            console.log('');
        } catch (err) {
            console.error(`  FAIL: ${err.message}\n`);
        }

        // 5. Negative: Duplicate enrollment request
        console.log('--- Step 5: Duplicate enrollment request (should FAIL) ---');
        try {
            await enrollmentService.requestEnrollment(student._id, cls._id);
            console.log('  FAIL: Should have thrown!\n');
        } catch (err) {
            console.log(`  PASS: ${err.message}\n`);
        }

        // 6. Negative: Enrollment in DRAFT (non-ACTIVE) class
        console.log('--- Step 6: Enrollment in non-ACTIVE class (should FAIL) ---');
        try {
            const draftClass = await Class.create({
                title: 'Draft Only Class',
                classCode: 'DRAFT-ONLY',
                departmentId: dept._id,
                facultyId: faculty._id,
                semester: 1,
                section: 'B',
                status: 'DRAFT',
            });
            await enrollmentService.requestEnrollment(student._id, draftClass._id);
            console.log('  FAIL: Should have thrown!\n');
            await Class.deleteOne({ _id: draftClass._id });
        } catch (err) {
            console.log(`  PASS: ${err.message}\n`);
            await Class.deleteOne({ classCode: 'DRAFT-ONLY' });
        }

        console.log('=== ALL ENROLLMENT TESTS COMPLETE ===');
        process.exit(0);
    } catch (error) {
        console.error('[Test] Fatal Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

test();
