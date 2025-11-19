// server/controllers/facultyController.js

const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const LabSubmission = require('../models/Submission');

// @desc    Get all courses taught by the logged-in faculty
// @route   GET /api/faculty/courses
// @access  Private (Faculty)
const getMyCourses = asyncHandler(async (req, res) => {
    const facultyId = req.user._id;

    const courses = await Course.find({ faculty: facultyId })
        .populate('students', 'name email'); // Show enrolled students

    res.json(courses);
});

// @desc    Get all submissions for a specific course
// @route   GET /api/faculty/submissions/:courseId
// @access  Private (Faculty)
const getSubmissionsForCourse = asyncHandler(async (req, res) => {
    const courseId = req.params.courseId;
    const facultyId = req.user._id;

    // Ensure the faculty teaches this course
    const course = await Course.findOne({ _id: courseId, faculty: facultyId });
    if (!course) {
        res.status(404);
        throw new Error('Course not found or faculty not assigned to this course');
    }

    const submissions = await LabSubmission.find({ course: courseId })
        .populate('student', 'name email'); // Show student who submitted

    res.json(submissions);
});

// @desc    Review and Grade a Submission
// @route   PUT /api/faculty/review/:submissionId
// @access  Private (Faculty)
const reviewSubmission = asyncHandler(async (req, res) => {
    const submissionId = req.params.submissionId;
    const { grade, reviewComments } = req.body;
    const facultyId = req.user._id;

    const submission = await LabSubmission.findById(submissionId);

    if (!submission) {
        res.status(404);
        throw new Error('Submission not found');
    }

    // Ensure the logged-in faculty is assigned to review this submission
    if (submission.faculty.toString() !== facultyId.toString()) {
        res.status(403);
        throw new Error('Not authorized to review this submission');
    }

    submission.grade = grade;
    submission.reviewComments = reviewComments;
    submission.isReviewed = true;

    const updatedSubmission = await submission.save();

    res.json(updatedSubmission);
});

module.exports = { getMyCourses, getSubmissionsForCourse, reviewSubmission };