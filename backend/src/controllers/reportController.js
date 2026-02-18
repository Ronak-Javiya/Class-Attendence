const Class = require('../models/Class');
const Department = require('../models/Department');
const Enrollment = require('../models/Enrollment');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceEntry = require('../models/AttendanceEntry');

/**
 * GET /reports
 * Returns list of available reports with metadata.
 */
const getReportsList = async (req, res, next) => {
    try {
        const reports = [
            {
                id: 'attendance-summary',
                name: 'Attendance Summary Report',
                description: 'Summary of attendance across all classes',
                type: 'attendance',
                filters: ['dateRange', 'class', 'department'],
            },
            {
                id: 'class-performance',
                name: 'Class Performance Report',
                description: 'Detailed performance metrics per class',
                type: 'class',
                filters: ['dateRange', 'class'],
            },
            {
                id: 'student-attendance',
                name: 'Student Attendance Report',
                description: 'Individual student attendance records',
                type: 'student',
                filters: ['dateRange', 'student', 'class'],
            },
            {
                id: 'enrollment-status',
                name: 'Enrollment Status Report',
                description: 'Current enrollment statistics',
                type: 'enrollment',
                filters: ['department', 'class'],
            },
            {
                id: 'dispute-analysis',
                name: 'Dispute Analysis Report',
                description: 'Analysis of raised and resolved disputes',
                type: 'dispute',
                filters: ['dateRange', 'class'],
            },
        ];

        res.status(200).json({
            success: true,
            data: reports,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /reports/generate
 * Generates a report based on parameters.
 */
const generateReport = async (req, res, next) => {
    try {
        const { reportId, filters } = req.body;
        const { dateRange, classId, departmentId, studentId } = filters || {};

        let reportData = {};

        switch (reportId) {
            case 'attendance-summary':
                reportData = await generateAttendanceSummary(dateRange, classId, departmentId);
                break;
            case 'class-performance':
                reportData = await generateClassPerformance(dateRange, classId);
                break;
            case 'student-attendance':
                reportData = await generateStudentAttendance(dateRange, studentId, classId);
                break;
            case 'enrollment-status':
                reportData = await generateEnrollmentStatus(departmentId, classId);
                break;
            case 'dispute-analysis':
                reportData = await generateDisputeAnalysis(dateRange, classId);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Unknown report type',
                });
        }

        res.status(200).json({
            success: true,
            data: {
                reportId,
                generatedAt: new Date().toISOString(),
                filters,
                data: reportData,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Helper functions for report generation
async function generateAttendanceSummary(dateRange, classId, departmentId) {
    const query = {};
    
    if (dateRange?.start && dateRange?.end) {
        query.date = {
            $gte: new Date(dateRange.start),
            $lte: new Date(dateRange.end),
        };
    }

    if (classId) query.classId = classId;

    const records = await AttendanceRecord.find(query)
        .populate('classId', 'name code departmentId')
        .populate('lectureId', 'date');

    const totalLectures = records.length;
    const totalPresent = records.reduce((sum, r) => sum + (r.presentCount || 0), 0);
    const totalAbsent = records.reduce((sum, r) => sum + (r.absentCount || 0), 0);

    return {
        totalLectures,
        totalPresent,
        totalAbsent,
        overallAttendanceRate: totalLectures > 0 
            ? ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(2)
            : 0,
        records: records.slice(0, 100), // Limit for performance
    };
}

async function generateClassPerformance(dateRange, classId) {
    const query = {};
    
    if (dateRange?.start && dateRange?.end) {
        query.date = {
            $gte: new Date(dateRange.start),
            $lte: new Date(dateRange.end),
        };
    }

    if (classId) query.classId = classId;

    const classes = await Class.find(classId ? { _id: classId } : {})
        .populate('facultyId', 'fullName')
        .populate('departmentId', 'name');

    const performance = await Promise.all(
        classes.map(async (cls) => {
            const records = await AttendanceRecord.find({ classId: cls._id });
            const avgAttendance = records.length > 0
                ? records.reduce((sum, r) => sum + (r.attendanceRate || 0), 0) / records.length
                : 0;

            return {
                classId: cls._id,
                className: cls.name,
                classCode: cls.code,
                faculty: cls.facultyId?.fullName,
                department: cls.departmentId?.name,
                totalLectures: records.length,
                averageAttendance: avgAttendance.toFixed(2),
            };
        })
    );

    return { classes: performance };
}

async function generateStudentAttendance(dateRange, studentId, classId) {
    const query = {};
    
    if (studentId) query.studentId = studentId;
    if (classId) query.classId = classId;

    const entries = await AttendanceEntry.find(query)
        .populate('studentId', 'fullName email')
        .populate('classId', 'name code')
        .populate('recordId', 'date')
        .sort({ createdAt: -1 })
        .limit(500);

    const summary = {
        total: entries.length,
        present: entries.filter(e => e.status === 'PRESENT').length,
        absent: entries.filter(e => e.status === 'ABSENT').length,
        disputed: entries.filter(e => e.status === 'DISPUTED').length,
    };

    return { summary, entries };
}

async function generateEnrollmentStatus(departmentId, classId) {
    const query = {};
    if (departmentId) query.departmentId = departmentId;

    const classes = await Class.find(classId ? { _id: classId } : query)
        .populate('departmentId', 'name')
        .populate('facultyId', 'fullName');

    const enrollmentData = await Promise.all(
        classes.map(async (cls) => {
            const enrollments = await Enrollment.find({ classId: cls._id });
            return {
                classId: cls._id,
                className: cls.name,
                department: cls.departmentId?.name,
                faculty: cls.facultyId?.fullName,
                totalEnrollments: enrollments.length,
                approved: enrollments.filter(e => e.status === 'APPROVED').length,
                pending: enrollments.filter(e => e.status === 'PENDING').length,
                rejected: enrollments.filter(e => e.status === 'REJECTED').length,
            };
        })
    );

    return { enrollments: enrollmentData };
}

async function generateDisputeAnalysis(dateRange, classId) {
    const AttendanceDispute = require('../models/AttendanceDispute');
    
    const query = {};
    if (classId) query.classId = classId;
    
    if (dateRange?.start && dateRange?.end) {
        query.createdAt = {
            $gte: new Date(dateRange.start),
            $lte: new Date(dateRange.end),
        };
    }

    const disputes = await AttendanceDispute.find(query)
        .populate('classId', 'name code')
        .populate('studentId', 'fullName');

    const summary = {
        total: disputes.length,
        pending: disputes.filter(d => d.status === 'PENDING').length,
        approved: disputes.filter(d => d.status === 'APPROVED').length,
        rejected: disputes.filter(d => d.status === 'REJECTED').length,
    };

    return { summary, disputes: disputes.slice(0, 100) };
}

module.exports = {
    getReportsList,
    generateReport,
};
