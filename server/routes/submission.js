// server/routes/submission.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.js'); 
const { restrictTo } = require('../middleware/roles.js'); // Assuming named export here
const Submission = require('../models/Submission.js');
const LabSession = require('../models/LabSession.js');

// --- Student Actions ---

// router.post('/', protect, restrictTo('Student'), async (req, res) => { // Original line 11
router.post('/', protect, restrictTo('Student'), async (req, res) => {

    const { sessionId, submittedCode } = req.body;
    // Use authenticated user id to avoid spoofing
    const studentId = req.user?.id || req.user?._id;
    
    try {
        // Check if session exists and if current time is before endTime
        const session = await LabSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Lab session not found.' });
        }

        const currentTime = new Date();
        if (currentTime > session.endTime) {
            return res.status(403).json({ message: 'This lab session has ended. Submissions are no longer accepted.' });
        }

        const existingSubmission = await Submission.findOne({ 
            session: sessionId, 
            student: studentId 
        });

        if (existingSubmission) {
            return res.status(400).json({ message: 'You have already submitted for this session.' });
        }
        
        // session.course is required by Submission model
        await Submission.create({
            session: sessionId,
            course: session.course,
            student: studentId,
            submittedCode,
        });

        res.status(201).json({ message: 'Submission successful!' });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ message: 'Server error during submission.' });
    }
});

// GET submission by id (for faculty review detail page) - MUST be before /:sessionId/:studentId
router.get('/id/:submissionId', protect, restrictTo('Faculty'), async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.submissionId)
            .populate('student', 'firstName lastName email')
            .populate({ path: 'session', select: 'title date startTime endTime description maxMarks course', populate: { path: 'course', select: 'name code' } })
            .populate('course', 'name code');

        if (!submission) return res.status(404).json({ message: 'Submission not found.' });

        res.json({ submission });
    } catch (error) {
        console.error('Error fetching submission by id:', error);
        res.status(500).json({ message: 'Error fetching submission.' });
    }
});

router.get('/:sessionId/:studentId', protect, async (req, res) => {
    try {
        const submission = await Submission.findOne({
            session: req.params.sessionId,
            student: req.params.studentId
        });
        
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }
        
        res.json({ submission });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching submission details.' });
    }
});

// --- Faculty Actions ---

router.put('/grade/:submissionId', protect, restrictTo('Faculty'), async (req, res) => {
    const { marks, feedback } = req.body;
    
    try {
        const submission = await Submission.findById(req.params.submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }
        
        // Validation
        const session = await LabSession.findById(submission.session);
        if (marks > session.maxMarks || marks < 0) {
            return res.status(400).json({ message: `Marks must be between 0 and ${session.maxMarks}.` });
        }
        
        submission.marks = marks;
        submission.feedback = feedback;
        // mark as reviewed so frontend can distinguish default 0 from graded 0
        submission.isReviewed = true;

        await submission.save();

        res.json({ message: 'Submission graded successfully.', submission });
    } catch (error) {
        res.status(500).json({ message: 'Error grading submission.' });
    }
});

module.exports = router;