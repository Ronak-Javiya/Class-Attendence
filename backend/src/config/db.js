const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI from environment variables.
 * Exits the process on connection failure — fail fast in production.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[DB] Connection failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
