/**
 * Seed Script — Creates initial users and a department for testing.
 *
 * Usage: node src/scripts/seed.js
 *
 * Safe to run multiple times — skips existing records.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');

const SEED_USERS = [
    {
        fullName: 'Dr. Sharma (HOD)',
        email: 'hod@college.edu',
        password: 'Hod@12345',
        role: 'HOD',
    },
    {
        fullName: 'Mrs. Gupta (Admin)',
        email: 'admin@college.edu',
        password: 'Admin@12345',
        role: 'ADMIN',
    },
    {
        fullName: 'Prof. Verma (Faculty)',
        email: 'faculty@college.edu',
        password: 'Faculty@12345',
        role: 'FACULTY',
    },
    {
        fullName: 'Rahul Student',
        email: 'student@college.edu',
        password: 'Student@12345',
        role: 'STUDENT',
    },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[Seed] Connected to MongoDB');

        // ---- Seed Users ----
        for (const userData of SEED_USERS) {
            const exists = await User.findOne({ email: userData.email });
            if (exists) {
                console.log(`[Seed] Skipping ${userData.email} — already exists`);
                continue;
            }

            const passwordHash = await User.hashPassword(userData.password);
            await User.create({
                fullName: userData.fullName,
                email: userData.email,
                passwordHash,
                role: userData.role,
                isActive: true,
            });
            console.log(`[Seed] Created ${userData.role}: ${userData.email}`);
        }

        // ---- Seed Department ----
        const existingDept = await Department.findOne({ code: 'CSE' });
        if (!existingDept) {
            const hodUser = await User.findOne({ email: 'hod@college.edu' });
            const dept = await Department.create({
                name: 'Computer Science & Engineering',
                code: 'CSE',
                hodId: hodUser ? hodUser._id : null,
            });
            console.log(`[Seed] Created Department: ${dept.code} (${dept.name})`);

            // Link faculty and HOD to this department
            if (hodUser) {
                hodUser.departmentId = dept._id;
                await hodUser.save();
            }
            const facultyUser = await User.findOne({ email: 'faculty@college.edu' });
            if (facultyUser) {
                facultyUser.departmentId = dept._id;
                await facultyUser.save();
            }
        } else {
            console.log('[Seed] Skipping CSE department — already exists');
        }

        console.log('[Seed] Done.');
        process.exit(0);
    } catch (error) {
        console.error('[Seed] Error:', error.message);
        process.exit(1);
    }
};

seed();

