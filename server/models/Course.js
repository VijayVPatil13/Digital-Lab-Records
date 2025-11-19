// server/models/Course.js
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    code: { // Unique Course ID (e.g., CSL37)
        type: String, 
        required: true, 
        unique: true, 
        uppercase: true, 
        trim: true,
    },
    section: { 
        type: String, 
        trim: true, 
        default: 'A' 
    },
    facultyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Reference to the User model (Faculty)
        required: true,
    },
    students: [{ // Array of approved student IDs (optional, can also rely on Enrollment model)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

module.exports = mongoose.model('Course', CourseSchema);