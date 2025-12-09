// server/routes/faculty.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.js');
const { restrictTo } = require('../middleware/roles.js');
const Course = require('../models/Course.js');
const LabSession = require('../models/LabSession.js');
const Submission = require('../models/Submission.js');
const User = require('../models/User.js'); // Added User model import

// --- Course Management ---

router.get('/courses/:facultyId', protect, restrictTo('Faculty'), async (req, res) => {
    try {
        const courses = await Course.find({ faculty: req.params.facultyId })
            .populate('students', 'fullName'); // Populate students to show count
        res.json({ courses });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching faculty courses.' });
    }
});

// --- Session Management ---

router.get('/sessions/:courseId', protect, restrictTo('Faculty'), async (req, res) => {
    try {
        const course = await Course.findOne({ code: req.params.courseId });
        if (!course) return res.status(404).json({ message: 'Course not found.' });

        const sessions = await LabSession.find({ course: course._id }).sort({ date: -1 });
        res.json({ sessions, course });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course sessions.' });
    }
});

router.post('/sessions', protect, restrictTo('Faculty'), async (req, res) => {
    const { courseId, title, date, description, maxMarks } = req.body;
    try {
        const course = await Course.findOne({ code: courseId });
        if (!course) return res.status(404).json({ message: 'Course not found.' });

        const newSession = await LabSession.create({
            course: course._id,
            title,
            date,
            description,
            maxMarks,
        });
        res.status(201).json({ session: newSession, message: 'Lab session created successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating lab session.' });
    }
});

// --- Session Review / Grading ---

router.get('/review/:sessionId', protect, restrictTo('Faculty'), async (req, res) => {
    try {
        const session = await LabSession.findById(req.params.sessionId).populate('course');
        if (!session) return res.status(404).json({ message: 'Session not found.' });

        const enrolledStudents = await Course.findById(session.course._id)
            .populate('students', 'fullName email');

        const submissions = await Submission.find({ session: session._id })
            .populate('student', 'fullName email');
            
        const reviewList = enrolledStudents.students.map(student => {
            const submission = submissions.find(sub => sub.student._id.toString() === student._id.toString());
            return {
                student: student,
                submission: submission 
                    ? submission.toObject() 
                    : { submittedCode: 'N/A', marks: null, feedback: '', isReviewed: false },

                hasSubmitted: !!submission,
            };
        });

        res.json({ session, reviewList });
    } catch (error) {
        console.error('Review data error:', error);
        res.status(500).json({ message: 'Error fetching review data.' });
    }
});

module.exports = router;