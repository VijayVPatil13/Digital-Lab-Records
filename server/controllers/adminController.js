// server/controllers/adminController.js
const Course = require('../models/Course');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Create a new Course and assign faculty
// @route   POST /api/admin/courses
// @access  Private (Admin)
exports.createCourse = asyncHandler(async (req, res) => {
    const { name, code, facultyId, description } = req.body; 
    
    if (!name || !code || !facultyId) {
        res.status(400);
        throw new Error('Course Name, Code, and Faculty ID are required.');
    }

    const courseExists = await Course.findOne({ code });
    if (courseExists) {
        res.status(400);
        throw new Error(`Course with code ${code} already exists.`);
    }
    
    // NOTE: Using 'faculty' field in Course model
    const newCourse = await Course.create({
        name,
        code: code.toUpperCase(),
        description,
        faculty: facultyId, 
    });
    
    res.status(201).json({
        message: `Course ${newCourse.name} created and faculty assigned.`,
        course: newCourse,
    });
});