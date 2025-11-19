// server/models/Enrollment.js
const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
    course: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: { // 'pending', 'approved', 'rejected'
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    requestedAt: { 
        type: Date, 
        default: Date.now 
    },
});

// Ensures a student can only have one request/status per course
EnrollmentSchema.index({ course: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);