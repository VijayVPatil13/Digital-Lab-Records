// server/models/Submission.js

const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabSession',
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    submittedCode: {
        type: String, // Storing code content
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    grade: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    feedback: {
        type: String,
    }
});

SubmissionSchema.index({ session: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);