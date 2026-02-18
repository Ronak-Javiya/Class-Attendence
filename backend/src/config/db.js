const mongoose = require('mongoose');
const config = require('./index');

/**
 * Connects to MongoDB using the URI from configuration.
 * Exits the process on connection failure — fail fast in production.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.database.mongodb.uri);
        console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[DB] Connection failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
