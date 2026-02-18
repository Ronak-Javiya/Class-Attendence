/**
 * Test Script — Directly tests the full class lifecycle via service layer.
 * This bypasses HTTP entirely to get clear error output.
 *
 * Usage: node src/scripts/test-academic.js
 */
const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');
const Department = require('../models/Department');
const Class = require('../models/Class');
const Timetable = require('../models/Timetable');
const classService = require('../services/classService');

const test = async () => {
    try {
        await mongoose.connect(config.database.mongodb.uri);
        console.log('[Test] Connected to MongoDB\n');

        // Get test users
        const faculty = await User.findOne({ email: 'faculty@college.edu' });
        const hod = await User.findOne({ email: 'hod@college.edu' });
        const student = await User.findOne({ email: 'student@college.edu' });
        const dept = await Department.findOne({ code: 'CSE' });

        if (!faculty || !hod || !dept) {
            console.error('[Test] Seed data missing. Run: npm run seed');
            process.exit(1);
        }
        console.log(`[Test] Faculty: ${faculty.email}`);
        console.log(`[Test] HOD: ${hod.email}`);
        console.log(`[Test] Dept: ${dept.code} (${dept._id})\n`);

        // Clean up any previous test data
        await Class.deleteMany({ classCode: 'TEST-SEM1-A' });
        await Timetable.deleteMany({});
        console.log('[Test] Cleaned up previous test data\n');

        // 1. Faculty creates a class
        console.log('--- Step 1: Faculty creates class ---');
        const cls = await classService.createClass({
            title: 'Test Subject',
            classCode: 'TEST-SEM1-A',
            departmentId: dept._id,
            semester: 1,
            section: 'A',
            facultyId: faculty._id,
        });
        console.log(`  Created: ${cls.classCode} | Status: ${cls.status}\n`);

        // 2. Faculty adds timetable slot
        console.log('--- Step 2: Faculty adds timetable slot ---');
        try {
            const slot = await classService.addTimetableSlot(cls._id, faculty._id, {
                dayOfWeek: 1,
                startTime: '09:00',
                endTime: '10:00',
            });
            console.log(`  Slot added: Day ${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}\n`);
        } catch (err) {
            console.error(`  ERROR adding slot: ${err.message}`);
            console.error(`  Stack: ${err.stack}\n`);
        }

        // 3. Faculty submits class
        console.log('--- Step 3: Faculty submits class ---');
        try {
            const submitted = await classService.submitClass(cls._id, faculty._id);
            console.log(`  Status: ${submitted.status}\n`);
        } catch (err) {
            console.error(`  ERROR submitting: ${err.message}\n`);
        }

        // 4. HOD approves
        console.log('--- Step 4: HOD approves class ---');
        try {
            const approved = await classService.approveClass(cls._id, hod._id);
            console.log(`  Status: ${approved.status}\n`);
        } catch (err) {
            console.error(`  ERROR approving: ${err.message}\n`);
        }

        // 5. Student views active classes
        console.log('--- Step 5: Student views active classes ---');
        const studentClasses = await classService.getClasses({
            userId: student._id,
            role: 'STUDENT',
        });
        console.log(`  Active classes visible: ${studentClasses.length}\n`);

        // 6. Negative test: Faculty cannot approve own class
        console.log('--- Step 6: Negative - Faculty approving own class ---');
        try {
            await classService.approveClass(cls._id, faculty._id);
            console.log('  FAIL: Should have thrown error!\n');
        } catch (err) {
            console.log(`  PASS: ${err.message}\n`);
        }

        console.log('=== ALL TESTS COMPLETE ===');
        process.exit(0);
    } catch (error) {
        console.error('[Test] Fatal Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

test();
