// server/routes/studentRoutes.js
const express = require('express');
const router = express.Router();

// --- CRITICAL DEPENDENCY IMPORTS ---
const protect = require('../middleware/auth.js');
const { restrictTo } = require('../middleware/roles.js');
const Course = require('../models/Course.js');
const User = require('../models/User.js');
const LabSession = require('../models/LabSession.js');
const Submission = require('../models/Submission.js');
const Enrollment = require('../models/Enrollment.js'); // Necessary for enrollment logic

// Apply middleware to all routes in this router
router.use(protect, restrictTo('Student'));


// --- 1. POST /enroll (Handles Join Course Request)
// Logic for submitting a new enrollment request (status: 'pending')
router.post('/enroll', async (req, res) => {
    // The 'protect' middleware ensures req.user.id exists
    const { courseCode } = req.body;
    const studentId = req.user.id; // Correctly pull ID from JWT payload
    
    if (!courseCode) {
        return res.status(400).json({ message: 'Course ID is required.' });
    }

    try {
        const course = await Course.findOne({ code: courseCode.toUpperCase() });
        if (!course) {
            return res.status(404).json({ message: `Course with ID ${courseCode} not found.` });
        }

        // Checks for existing enrollment/request (approved or pending)
        const existingEnrollment = await Enrollment.findOne({
            course: course._id,
            student: studentId,
        });

        if (existingEnrollment) {
            const statusMessage = existingEnrollment.status === 'approved' 
                ? 'You are already enrolled in this course.'
                : 'Your enrollment request is already pending approval.';
            return res.status(409).json({ message: statusMessage });
        }

        // Creates a new pending request
        const newRequest = new Enrollment({
            course: course._id,
            student: studentId,
            status: 'pending', 
        });

        await newRequest.save();

        res.status(201).json({ 
            message: `Enrollment request for ${course.name} submitted. Waiting for approval.` 
        });

    } catch (error) {
        console.error('Error handling enrollment:', error.message);
        res.status(500).json({ message: 'Server error during enrollment.' });
    }
});


// --- 2. GET /courses/enrolled (FIXED LOGIC for Student Dashboard)
// Fetches courses with status 'approved' from the Enrollment model.
router.get('/courses/enrolled', async (req, res) => {
    try {
        const studentId = req.user.id; // Correctly pull ID from JWT payload
        
        // Finds approved enrollment records and populates the course data
        const enrollments = await Enrollment.find({ 
            student: studentId, 
            status: 'approved' 
        }).populate({
            path: 'course', // Populate the Course document
            select: 'name code description faculty students', 
            populate: {
                path: 'faculty', // Populate faculty User details
                select: 'firstName lastName'
            }
        });        // Extract the course object from each enrollment record
        const courses = enrollments
            .map(e => e.course)
            .filter(c => c !== null); // Filter out any null courses

        res.status(200).json({ courses });
    } catch (error) {
        console.error('Error fetching student courses:', error.message);
        res.status(500).json({ message: 'Failed to retrieve enrolled courses.' });
    }
});

// --- 3. GET /labs/:courseCode (Fetch lab sessions and submission status)
// Logic for fetching lab sessions remains embedded.
router.get('/labs/:courseCode', async (req, res) => {
    try {
        const course = await Course.findOne({ code: req.params.courseCode });
        if (!course) return res.status(404).json({ message: 'Course not found.' });

        const sessions = await LabSession.find({ course: course._id }).sort({ date: 1 });
        
        const submissions = await Submission.find({ 
            student: req.user.id, 
            session: { $in: sessions.map(s => s._id) } 
        });

        const labs = sessions.map(session => {
            const submission = submissions.find(sub => sub.session.equals(session._id));
            return {
                ...session.toObject(),
                submissionStatus: submission ? 'Submitted' : 'Pending',
                submissionDetails: submission ? { marks: submission.marks, feedback: submission.feedback, submittedAt: submission.submittedAt, submittedCode: submission.submittedCode, sessionId: session._id, submissionId: submission._id } : {sessionId: session._id, submissionId: null}
            };
        });
        
        res.json({ course, labs });
    } catch (error) {
    console.error('Error fetching student labs:', error);
        res.status(500).json({ message: 'Error fetching lab sessions.' });
    }
});

module.exports = router;