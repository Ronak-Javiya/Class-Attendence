const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const classRoutes = require('./routes/classRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const faceRoutes = require('./routes/faceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const auditRoutes = require('./routes/auditRoutes');
const reportRoutes = require('./routes/reportRoutes');
const hodRoutes = require('./routes/hodRoutes');
const logger = require('./utils/logger');

const app = express();
const PORT = config.server.port;

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
app.use('/api/register', registrationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api', attendanceRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/face', faceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/hod', hodRoutes);

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
        logger.info(`Server running on port ${PORT} in ${config.server.env} mode`);
    });
};

startServer();

module.exports = app; // Export for testing
