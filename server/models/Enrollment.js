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

    // NEW: SECTION SUPPORT
    section: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },

    status: { 
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },

    requestedAt: { 
        type: Date, 
        default: Date.now 
    },
});

//  FIXED: UNIQUE PER (course + section + student)
EnrollmentSchema.index(
    { course: 1, student: 1, section: 1 }, 
    { unique: true }
);

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
