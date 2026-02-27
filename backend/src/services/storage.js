/**
 * storage.js — Hybrid storage abstraction.
 * Currently uses local filesystem temp folder.
 * Designed for easy swap to S3 / cloud storage later.
 */
const fs = require('fs');
const path = require('path');

const os = require('os');

const TEMP_DIR = process.env.VERCEL
    ? path.join(os.tmpdir(), 'smart-attendance-temp')
    : path.join(__dirname, '..', '..', 'temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

function getBaseDir() {
    return TEMP_DIR;
}

/**
 * Get the full path for a session's temp folder.
 */
function getSessionFolder(sessionId) {
    const folder = path.join(TEMP_DIR, sessionId.toString());
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
    return folder;
}

/**
 * Save a buffer to the session's temp folder.
 * @returns {string} full path to the saved file
 */
function saveFile(sessionId, filename, buffer) {
    const folder = getSessionFolder(sessionId);
    const filePath = path.join(folder, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

/**
 * List all files in a session folder.
 * @returns {string[]} array of absolute file paths
 */
function listFiles(sessionId) {
    const folder = getSessionFolder(sessionId);
    return fs.readdirSync(folder).map(f => path.join(folder, f));
}

/**
 * Delete a session's temp folder and all its contents.
 */
function deleteSessionFiles(sessionId) {
    const folder = path.join(TEMP_DIR, sessionId.toString());
    if (fs.existsSync(folder)) {
        fs.rmSync(folder, { recursive: true, force: true });
    }
}

module.exports = { getBaseDir, getSessionFolder, saveFile, listFiles, deleteSessionFiles };
