const Class = require('../models/Class');
const Enrollment = require('../models/Enrollment');
const AttendanceRecord = require('../models/AttendanceRecord');
const Lecture = require('../models/Lecture');
const AttendanceDispute = require('../models/AttendanceDispute');
const User = require('../models/User');

/**
 * GET /hod/stats
 * Returns HOD-specific statistics.
 */
const getHodStats = async (req, res, next) => {
    try {
        const departmentId = req.user.departmentId;

        const [
            pendingClasses,
            totalClasses,
            totalFaculty,
            totalStudents,
            recentLectures,
            pendingDisputes,
        ] = await Promise.all([
            Class.countDocuments({ departmentId, status: 'PENDING_APPROVAL' }),
            Class.countDocuments({ departmentId }),
            User.countDocuments({ role: 'FACULTY', departmentId }),
            User.countDocuments({ role: 'STUDENT', departmentId }),
            Lecture.find({ departmentId })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('classId', 'name code'),
            AttendanceDispute.countDocuments({ 
                departmentId, 
                status: 'PENDING' 
            }),
        ]);

        // Calculate attendance trend (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentRecords = await AttendanceRecord.find({
            departmentId,
            date: { $gte: sevenDaysAgo },
        });

        const avgAttendance = recentRecords.length > 0
            ? recentRecords.reduce((sum, r) => sum + (r.attendanceRate || 0), 0) / recentRecords.length
            : 0;

        res.status(200).json({
            success: true,
            data: {
                pendingClasses,
                totalClasses,
                totalFaculty,
                totalStudents,
                recentLectures,
                pendingDisputes,
                averageAttendanceRate: avgAttendance.toFixed(2),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /classes/pending-approval
 * Returns classes pending HOD approval.
 */
const getPendingApprovalClasses = async (req, res, next) => {
    try {
        const departmentId = req.user.departmentId;

        const classes = await Class.find({ 
            departmentId, 
            status: 'PENDING_APPROVAL' 
        })
            .populate('facultyId', 'fullName email')
            .populate('departmentId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: classes,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getHodStats,
    getPendingApprovalClasses,
};
