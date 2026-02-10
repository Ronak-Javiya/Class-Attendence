const mongoose = require('mongoose');

/**
 * StudentEmbedding — Stores the 512-d face embedding for a student.
 *
 * This replaces the NPZ file storage. Embeddings are upserted by Node.js
 * after receiving them from the Python AI service.
 *
 * One embedding per student. Re-enrollment overwrites.
 */
const studentEmbeddingSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    embedding: {
        type: [Number],
        required: true,
        validate: {
            validator: (v) => v.length === 512,
            message: 'Embedding must be exactly 512 dimensions',
        },
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const StudentEmbedding = mongoose.model('StudentEmbedding', studentEmbeddingSchema);

module.exports = StudentEmbedding;
