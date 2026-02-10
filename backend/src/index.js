require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const classRoutes = require('./routes/classRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const faceRoutes = require('./routes/faceRoutes');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------------------------------------------
// Global Middleware
// -------------------------------------------------------
app.use(helmet());                   // Security headers
app.use(cors());                     // CORS (configure origins in production)
app.use(express.json({ limit: '1mb' })); // JSON body parsing

// -------------------------------------------------------
// Health Check
// -------------------------------------------------------
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Smart Attendance College API is running',
        timestamp: new Date().toISOString(),
    });
});

// -------------------------------------------------------
// API Routes
// -------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api', attendanceRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/face', faceRoutes);

// -------------------------------------------------------
// 404 Handler
// -------------------------------------------------------
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// -------------------------------------------------------
// Centralized Error Handler (must be last)
// -------------------------------------------------------
app.use(errorHandler);

// -------------------------------------------------------
// Start Server
// -------------------------------------------------------
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
};

startServer();

module.exports = app; // Export for testing
