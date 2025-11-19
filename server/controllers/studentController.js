// server/controllers/studentController.js

const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');

// @desc    Enroll in a Course
// @route   POST /api/student/enroll/:courseId
// @access  Private (Student)
const enrollInCourse = asyncHandler(async (req, res) => {
    const courseId = req.params.courseId;
    const studentId = req.user._id; // ID from auth middleware

    const course = await Course.findById(courseId);

    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if student is already enrolled
    if (course.students.includes(studentId)) {
        res.status(400);
        throw new Error('Already enrolled in this course');
    }

    course.students.push(studentId);
    await course.save();

    res.json({
        message: 'Enrollment successful',
        courseName: course.name,
    });
});

// @desc    Get enrolled courses
// @route   GET /api/student/courses
// @access  Private (Student)
const getEnrolledCourses = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    const courses = await Course.find({ students: studentId })
        .populate('faculty', 'name email'); // Populate faculty details

    res.json(courses);
});

module.exports = { enrollInCourse, getEnrolledCourses };