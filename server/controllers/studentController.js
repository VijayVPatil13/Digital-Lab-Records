const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// ✅ COURSE + SECTION AWARE ENROLLMENT
const submitEnrollmentRequest = asyncHandler(async (req, res) => {
    const { courseCode, section } = req.body;
    const studentId = req.user.id;

    if (!courseCode || !section) {
        res.status(400);
        throw new Error('Course code and section are required.');
    }

    const course = await Course.findOne({ code: courseCode.toUpperCase() });
    if (!course) {
        res.status(404);
        throw new Error(`Course with code ${courseCode} not found.`);
    }

    const existingEnrollment = await Enrollment.findOne({
        course: course._id,
        student: studentId,
        section: section.toUpperCase()
    });

    if (existingEnrollment) {
        const statusMessage =
            existingEnrollment.status === 'approved'
                ? 'You are already enrolled in this course & section.'
                : 'Your enrollment request is already pending approval.';
        res.status(409);
        throw new Error(statusMessage);
    }

    const newRequest = new Enrollment({
        course: course._id,
        student: studentId,
        section: section.toUpperCase(),  // ✅ SECTION STORED
        status: 'pending'
    });

    await newRequest.save();

    res.status(201).json({
        message: `Enrollment request for ${course.name} (Section ${section.toUpperCase()}) submitted. Waiting for faculty approval.`,
    });
});

// ✅ RETURN COURSE + SECTION TO DASHBOARD
const getEnrolledCourses = asyncHandler(async (req, res) => {
    const studentId = req.user.id;

    const enrollments = await Enrollment.find({
        student: studentId,
        status: 'approved'
    }).populate({
        path: 'course',
        select: 'name code description students faculty',
        populate: {
            path: 'faculty',
            select: 'fullName'
        }
    });

    const courses = enrollments.map(e => ({
        ...e.course.toObject(),
        section: e.section   // ✅ IMPORTANT FOR STUDENT UI
    }));

    res.json({ courses });
});

module.exports = {
    submitEnrollmentRequest,
    getEnrolledCourses
};
