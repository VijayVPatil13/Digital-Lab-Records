// server/controllers/studentController.js
const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// @desc    Submit enrollment request (status: pending)
// @route   POST /api/student/enroll
// @access  Private (Student)
const submitEnrollmentRequest = asyncHandler(async (req, res) => {
    const { courseCode } = req.body;
    const studentId = req.user.id; 

    const course = await Course.findOne({ code: courseCode.toUpperCase() });
    if (!course) {
        res.status(404);
        throw new Error(`Course with code ${courseCode} not found.`);
    }

    const existingEnrollment = await Enrollment.findOne({ course: course._id, student: studentId });
    
    if (existingEnrollment) {
        const statusMessage = existingEnrollment.status === 'approved' 
            ? 'You are already enrolled in this course.'
            : 'Your enrollment request is already pending approval.';
        res.status(409);
        throw new Error(statusMessage);
    }
    
    const newRequest = new Enrollment({ course: course._id, student: studentId, status: 'pending' });
    await newRequest.save();

    res.status(201).json({
        message: `Enrollment request for ${course.name} submitted. Waiting for faculty approval.`,
    });
});

// @desc    Get enrolled courses (Approved Status)
// @route   GET /api/student/courses/enrolled
// @access  Private (Student)
const getEnrolledCourses = asyncHandler(async (req, res) => {
    const studentId = req.user.id;

    // CRITICAL FIX: The deep population query, correctly retrieving the Course data
    const enrollments = await Enrollment.find({ 
        student: studentId, 
        status: 'approved' 
    })
    .populate({
        path: 'course', 
        select: 'name code description students faculty', // Selects main course fields
        populate: {
            path: 'faculty', // Populates the 'faculty' field (which is a User ID)
            select: 'fullName'
        }
    });

    const courses = enrollments
        .map(e => e.course)
        .filter(c => c !== null); 

    res.json({ courses });
});

module.exports = { submitEnrollmentRequest, getEnrolledCourses };