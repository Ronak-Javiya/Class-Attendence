const Lecture = require('../models/Lecture');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceEntry = require('../models/AttendanceEntry');
const AttendancePhoto = require('../models/AttendancePhoto');
const AttendanceOverride = require('../models/AttendanceOverride');
const Class = require('../models/Class');
const Timetable = require('../models/Timetable');
const User = require('../models/User');
const { processLectureAttendance } = require('../workers/attendanceWorker');
const logger = require('../utils/logger');

// -------------------------------------------------------
// Faculty: Create Lecture
// -------------------------------------------------------

/**
 * Creates a new lecture session.
 *
 * Validations:
 *   - Faculty must own the class.
 *   - Class must be ACTIVE.
 *   - Timetable slot must belong to the class.
 *   - Slot's dayOfWeek must match the current date's day.
 *   - No duplicate lecture for same class/slot/day.
 */
const createLecture = async (facultyId, { classId, timetableSlotId }) => {
    // Verify class
    const cls = await Class.findById(classId);
    if (!cls) {
        const err = new Error('Class not found');
        err.statusCode = 404;
        throw err;
    }
    if (cls.status !== 'ACTIVE') {
        const err = new Error('Only ACTIVE classes can have lectures');
        err.statusCode = 400;
        throw err;
    }
    if (cls.facultyId.toString() !== facultyId.toString()) {
        const err = new Error('Only the class owner can create lectures');
        err.statusCode = 403;
        throw err;
    }

    // Verify timetable slot
    const slot = await Timetable.findById(timetableSlotId);
    if (!slot || slot.classId.toString() !== classId) {
        const err = new Error('Timetable slot not found or does not belong to this class');
        err.statusCode = 404;
        throw err;
    }

    // Validate day matches
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const todayDay = today.getDay(); // 0=Sunday, 6=Saturday

    if (slot.dayOfWeek !== todayDay) {
        const err = new Error(
            `Timetable slot is for day ${slot.dayOfWeek} but today is day ${todayDay}`
        );
        err.statusCode = 400;
        throw err;
    }

    // Check for duplicate lecture
    const existing = await Lecture.findOne({
        classId,
        timetableSlotId,
        date: todayStr,
    });
    if (existing) {
        const err = new Error('Lecture already exists for this class, slot, and date');
        err.statusCode = 409;
        throw err;
    }

    const lecture = await Lecture.create({
        classId,
        timetableSlotId,
        date: todayStr,
        createdBy: facultyId,
        status: 'CREATED',
    });

    logger.info('Lecture created', { lectureId: lecture._id, classId, date: todayStr });
    return lecture;
};

// -------------------------------------------------------
// Faculty: Upload Photos
// -------------------------------------------------------

/**
 * Records photo uploads for a lecture and triggers async attendance generation.
 *
 * Validations:
 *   - Only the lecture creator can upload.
 *   - Lecture must be in CREATED or PHOTO_UPLOADED state.
 *   - Upload window: within 2 hours of slot start time.
 *
 * For MVP: storageUrls are mock paths (no actual file storage).
 */
const uploadPhotos = async (lectureId, facultyId, storageUrls) => {
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
        const err = new Error('Lecture not found');
        err.statusCode = 404;
        throw err;
    }

    // Only creator can upload
    if (lecture.createdBy.toString() !== facultyId.toString()) {
        const err = new Error('Only the lecture creator can upload photos');
        err.statusCode = 403;
        throw err;
    }

    // State check: only CREATED or PHOTO_UPLOADED allows photo uploads
    if (!['CREATED', 'PHOTO_UPLOADED'].includes(lecture.status)) {
        const err = new Error(`Cannot upload photos when lecture status is: ${lecture.status}`);
        err.statusCode = 400;
        throw err;
    }

    // Time window check: Removed per user request. 
    // Faculty can upload photos anytime for a valid lecture.

    // Save photos (append-only)
    const photoDocuments = storageUrls.map((url) => ({
        lectureId,
        storageUrl: url,
        uploadedBy: facultyId,
    }));
    await AttendancePhoto.insertMany(photoDocuments);

    // Transition to PHOTO_UPLOADED if currently CREATED
    if (lecture.status === 'CREATED') {
        lecture.status = 'PHOTO_UPLOADED';
        await lecture.save();
    }

    logger.info('Photos uploaded', { lectureId, count: storageUrls.length });

    // Trigger async attendance generation
    // In production: dispatch to message queue. For MVP: call directly (non-blocking).
    setImmediate(() => {
        processLectureAttendance(lectureId).catch((err) => {
            logger.error('Async attendance generation failed', { lectureId, error: err.message });
        });
    });

    return { photosUploaded: storageUrls.length, lectureStatus: lecture.status };
};

// -------------------------------------------------------
// Student: View My Attendance
// -------------------------------------------------------

/**
 * Returns attendance entries for the requesting student, grouped by lecture.
 */
const getMyAttendance = async (studentId) => {
    const entries = await AttendanceEntry.find({ studentId })
        .populate({
            path: 'attendanceRecordId',
            select: 'lectureId classId generatedAt confidenceScore',
            populate: [
                {
                    path: 'lectureId',
                    select: 'date timetableSlotId classId',
                    populate: { path: 'timetableSlotId', select: 'dayOfWeek startTime endTime' },
                },
                {
                    path: 'classId',
                    select: 'title classCode',
                },
            ],
        })
        .sort({ createdAt: -1 });

    return entries;
};

// -------------------------------------------------------
// Faculty/Admin/HOD: View Class Attendance
// -------------------------------------------------------

/**
 * Returns lecture-wise attendance summary for a class.
 * Faculty must own the class. Admin/HOD can view any.
 */
const getClassAttendance = async (classId, user) => {
    const cls = await Class.findById(classId);
    if (!cls) {
        const err = new Error('Class not found');
        err.statusCode = 404;
        throw err;
    }

    // Faculty can only view their own class
    if (user.role === 'FACULTY' && cls.facultyId.toString() !== user.userId.toString()) {
        const err = new Error('You can only view attendance for your own class');
        err.statusCode = 403;
        throw err;
    }

    // Get all locked lectures for this class
    const lectures = await Lecture.find({ classId, status: 'LOCKED' })
        .populate('timetableSlotId', 'dayOfWeek startTime endTime')
        .sort({ date: -1 });

    // For each lecture, get the attendance summary
    const result = [];
    for (const lecture of lectures) {
        const record = await AttendanceRecord.findOne({ lectureId: lecture._id });
        if (!record) continue;

        const entries = await AttendanceEntry.find({ attendanceRecordId: record._id })
            .populate('studentId', 'fullName email');

        const presentCount = entries.filter((e) => e.status === 'PRESENT').length;
        const absentCount = entries.filter((e) => e.status === 'ABSENT').length;

        result.push({
            lecture: {
                _id: lecture._id,
                date: lecture.date,
                slot: lecture.timetableSlotId,
            },
            summary: {
                total: entries.length,
                present: presentCount,
                absent: absentCount,
            },
            entries,
        });
    }

    return result;
};

// -------------------------------------------------------
// Get Today's Lectures (Faculty)
// -------------------------------------------------------
const getTodaysLectures = async (userId, role) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    let query = { date: today };
    
    if (role === 'FACULTY') {
        // Get classes taught by this faculty
        const classes = await Class.find({ facultyId: userId });
        const classIds = classes.map(c => c._id);
        query.classId = { $in: classIds };
    }
    
    const lectures = await Lecture.find(query)
        .populate('classId', 'name code')
        .populate('timetableSlotId', 'dayOfWeek startTime endTime')
        .sort({ 'timetableSlotId.startTime': 1 });
    
    return lectures;
};

// -------------------------------------------------------
// Search Attendance (Admin/HOD)
// -------------------------------------------------------
const searchAttendance = async (query, user) => {
    if (!query || query.length < 2) {
        return [];
    }
    
    const searchRegex = new RegExp(query, 'i');
    
    // Search by student name/email or class name
    const students = await User.find({
        role: 'STUDENT',
        $or: [
            { fullName: searchRegex },
            { email: searchRegex },
        ],
    }).select('_id');
    
    const studentIds = students.map(s => s._id);
    
    const classes = await Class.find({
        $or: [
            { name: searchRegex },
            { code: searchRegex },
        ],
    }).select('_id');
    
    const classIds = classes.map(c => c._id);
    
    // Build attendance query
    let attendanceQuery = {
        $or: [
            { studentId: { $in: studentIds } },
            { classId: { $in: classIds } },
        ],
    };
    
    // If HOD, restrict to their department
    if (user.role === 'HOD' && user.departmentId) {
        const deptClasses = await Class.find({ departmentId: user.departmentId });
        const deptClassIds = deptClasses.map(c => c._id);
        attendanceQuery.classId = { $in: deptClassIds };
    }
    
    const entries = await AttendanceEntry.find(attendanceQuery)
        .populate('studentId', 'fullName email')
        .populate({
            path: 'attendanceRecordId',
            populate: {
                path: 'lectureId',
                select: 'date',
            },
        })
        .populate('classId', 'name code')
        .limit(50);
    
    return entries;
};

// -------------------------------------------------------
// Get Overrides History (Admin/HOD)
// -------------------------------------------------------
const getOverridesHistory = async (user) => {
    let query = {};
    
    // If HOD, restrict to their department
    if (user.role === 'HOD' && user.departmentId) {
        const classes = await Class.find({ departmentId: user.departmentId });
        const classIds = classes.map(c => c._id);
        
        // Find entries for these classes
        const entries = await AttendanceEntry.find({ classId: { $in: classIds } });
        const entryIds = entries.map(e => e._id);
        
        query.attendanceEntryId = { $in: entryIds };
    }
    
    const overrides = await AttendanceOverride.find(query)
        .populate({
            path: 'attendanceEntryId',
            populate: [
                { path: 'studentId', select: 'fullName email' },
                { path: 'classId', select: 'name code' },
            ],
        })
        .populate('approvedBy', 'fullName email role')
        .sort({ approvedAt: -1 })
        .limit(100);
    
    return overrides;
};

module.exports = {
    createLecture,
    uploadPhotos,
    getMyAttendance,
    getClassAttendance,
    getTodaysLectures,
    searchAttendance,
    getOverridesHistory,
};
