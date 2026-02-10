const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const StudentEmbedding = require('../models/StudentEmbedding');
const Enrollment = require('../models/Enrollment');
const logger = require('../utils/logger');

// -------------------------------------------------------
// Config
// -------------------------------------------------------
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const COSINE_THRESHOLD = parseFloat(process.env.COSINE_THRESHOLD || '0.55');
const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || '60000', 10);

// -------------------------------------------------------
// Helper: Cosine Similarity
// -------------------------------------------------------
const cosineSimilarity = (a, b) => {
    if (a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-12);
};

// -------------------------------------------------------
// Enrollment: Student Face Registration
// -------------------------------------------------------

/**
 * Enrolls a student's face by:
 * 1. Sending images to Python AI service.
 * 2. Upserting the returned embedding into MongoDB.
 *
 * @param {string} studentId - MongoDB ObjectId of the student.
 * @param {Array<string>} imagePaths - Absolute paths to image files on disk.
 * @returns {Object} - { imagesUsed, message }
 */
const enrollStudentFace = async (studentId, imagePaths) => {
    // Build multipart form
    const form = new FormData();
    form.append('studentId', studentId.toString());

    for (const imgPath of imagePaths) {
        form.append('images', fs.createReadStream(imgPath));
    }

    let response;
    try {
        response = await axios.post(`${AI_SERVICE_URL}/embedding/student`, form, {
            headers: form.getHeaders(),
            timeout: AI_TIMEOUT_MS,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
    } catch (err) {
        if (err.response && err.response.status === 422) {
            const error = new Error(err.response.data.detail || 'Face embedding generation failed. Upload clearer photos.');
            error.statusCode = 422;
            throw error;
        }
        const error = new Error('AI service unavailable. Please try again later.');
        error.statusCode = 503;
        throw error;
    }

    const { embedding, imagesUsed } = response.data;

    // Upsert into MongoDB (replaces NPZ storage)
    await StudentEmbedding.findOneAndUpdate(
        { studentId },
        { embedding, updatedAt: new Date() },
        { upsert: true, new: true }
    );

    logger.info('Face embedding enrolled', { studentId, imagesUsed });

    return { imagesUsed, message: 'Face enrolled successfully' };
};

// -------------------------------------------------------
// Attendance: Match Classroom Faces Against Enrolled Students
// -------------------------------------------------------

/**
 * Sends classroom photo(s) to Python, gets all face embeddings back,
 * then matches them against enrolled students for a given class.
 *
 * @param {string} classId - The class ID to scope enrolled students.
 * @param {Array<string>} imagePaths - Paths to classroom photo files.
 * @returns {Array<Object>} - [{ studentId, status, confidence }]
 */
const matchClassroomFaces = async (classId, imagePaths) => {
    // Step 1: Call Python /embedding/classroom
    const form = new FormData();
    for (const imgPath of imagePaths) {
        form.append('images', fs.createReadStream(imgPath));
    }

    let detections;
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/embedding/classroom`, form, {
            headers: form.getHeaders(),
            timeout: AI_TIMEOUT_MS,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
        detections = response.data;
    } catch (err) {
        const error = new Error('AI service unavailable for classroom detection.');
        error.statusCode = 503;
        throw error;
    }

    // Step 2: Get enrolled students for this class
    const enrollments = await Enrollment.find({ classId, status: 'APPROVED' }).select('studentId');
    const enrolledStudentIds = enrollments.map(e => e.studentId.toString());

    // Step 3: Fetch their embeddings from MongoDB
    const storedEmbeddings = await StudentEmbedding.find({
        studentId: { $in: enrolledStudentIds },
    });

    // Step 4: Match each detected face against stored embeddings
    const results = [];
    const matchedStudents = new Set();

    for (const stored of storedEmbeddings) {
        let bestScore = -1;

        for (const det of detections) {
            const score = cosineSimilarity(stored.embedding, det.embedding);
            if (score > bestScore) {
                bestScore = score;
            }
        }

        const isPresent = bestScore >= COSINE_THRESHOLD;
        results.push({
            studentId: stored.studentId.toString(),
            status: isPresent ? 'PRESENT' : 'ABSENT',
            confidence: Math.round(bestScore * 100) / 100,
        });

        if (isPresent) {
            matchedStudents.add(stored.studentId.toString());
        }
    }

    // Step 5: Students enrolled but without embeddings → ABSENT (confidence 0)
    for (const sid of enrolledStudentIds) {
        const alreadyProcessed = results.some(r => r.studentId === sid);
        if (!alreadyProcessed) {
            results.push({
                studentId: sid,
                status: 'ABSENT',
                confidence: 0,
            });
        }
    }

    logger.info('Classroom face matching complete', {
        classId,
        detectedFaces: detections.length,
        enrolledStudents: enrolledStudentIds.length,
        presentCount: matchedStudents.size,
    });

    return results;
};

module.exports = {
    enrollStudentFace,
    matchClassroomFaces,
    cosineSimilarity,
};
