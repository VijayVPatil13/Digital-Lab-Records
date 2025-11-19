// server/models/LabSession.js

const mongoose = require('mongoose');

const LabSessionSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    startTime: {
        type: Date, // When the session starts
        required: true,
    },
    endTime: {
        type: Date, // When the submission form closes
        required: true,
    },
    description: {
        type: String,
        default: 'No description provided.',
    },
    // Array to track attendance status
    attendance: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        attended: {
            type: Boolean,
            default: false,
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('LabSession', LabSessionSchema);