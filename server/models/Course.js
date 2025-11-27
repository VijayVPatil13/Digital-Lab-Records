// server/models/Course.js
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    section: { type: String, trim: true, default: 'A' },
    description: { type: String, default: 'General course.' },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Course', CourseSchema);