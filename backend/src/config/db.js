const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
    // Prevent Mongoose from creating new connections on every Vercel serverless request
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        const conn = await mongoose.connect(config.db.uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`MongoDB connection error: ${err.message}`);
        throw new Error('Database connection failed');
    }
};

module.exports = connectDB;
