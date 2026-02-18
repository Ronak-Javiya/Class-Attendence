const Class = require('../models/Class');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const AttendanceRecord = require('../models/AttendanceRecord');
const Lecture = require('../models/Lecture');

/**
 * GET /admin/stats
 * Returns system-wide statistics for Admin dashboard.
 */
const getAdminStats = async (req, res, next) => {
    try {
        const [
            totalUsers,
            totalStudents,
            totalFaculty,
            totalClasses,
            totalEnrollments,
            pendingEnrollments,
            activeLectures,
            totalAttendanceRecords,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'STUDENT' }),
            User.countDocuments({ role: 'FACULTY' }),
            Class.countDocuments(),
            Enrollment.countDocuments(),
            Enrollment.countDocuments({ status: 'PENDING' }),
            Lecture.countDocuments({ status: { $in: ['SCHEDULED', 'ACTIVE'] } }),
            AttendanceRecord.countDocuments(),
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalStudents,
                totalFaculty,
                totalClasses,
                totalEnrollments,
                pendingEnrollments,
                activeLectures,
                totalAttendanceRecords,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /admin/users
 * Returns paginated list of users with filters.
 */
const getUsers = async (req, res, next) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const users = await User.find(query)
            .select('-passwordHash -refreshTokenHash')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: { users, total, page: parseInt(page), pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminStats,
    getUsers,
};
