const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.js'); 
const { restrictTo } = require('../middleware/roles.js');
const Submission = require('../models/Submission.js');
const LabSession = require('../models/LabSession.js');
const Enrollment = require('../models/Enrollment.js');

// =======================================================
// STUDENT: SUBMIT LAB (SECTION-SAFE)
// =======================================================
router.post('/', protect, restrictTo('Student'), async (req, res) => {
    const { sessionId, submittedCode } = req.body;
    const studentId = req.user?.id || req.user?._id;

    try {
        const session = await LabSession.findById(sessionId).populate('course');
        if (!session) {
            return res.status(404).json({ message: 'Lab session not found.' });
        }

        const enrollment = await Enrollment.findOne({
            student: studentId,
            course: session.course._id,
            section: session.section,
            status: 'approved'
        });

        if (!enrollment) {
            return res.status(403).json({ message: 'You are not enrolled in this section.' });
        }

        const currentTime = new Date();
        if (currentTime > session.endTime) {
            return res.status(403).json({ message: 'This lab session has ended. Submissions are no longer accepted.' });
        }

        const existingSubmission = await Submission.findOne({
            session: sessionId,
            student: studentId,
            section: session.section
        });

        if (existingSubmission) {
            return res.status(400).json({ message: 'You have already submitted for this session.' });
        }

        await Submission.create({
            session: sessionId,
            course: session.course._id,
            section: session.section,        
            student: studentId,
            submittedCode,
        });

        res.status(201).json({ message: 'Submission successful!' });

    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ message: 'Server error during submission.' });
    }
});

// =======================================================
// FACULTY: GET SUBMISSION BY ID (SECTION SAFE)
// =======================================================
router.get('/id/:submissionId', protect, restrictTo('Faculty'), async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.submissionId)
            .populate('student', 'firstName lastName email usn') 
            .populate({
                path: 'session',
                select: 'title date startTime endTime description maxMarks course section',
                populate: { path: 'course', select: 'name code faculty' }
            })
            .populate('course', 'name code');

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }

        const facultyOwnsCourse =
            submission.session.course.faculty.toString() === req.user.id;

        if (!facultyOwnsCourse) {
            return res.status(403).json({ message: 'Not authorized to view this submission.' });
        }

        res.json({ submission });

    } catch (error) {
        console.error('Error fetching submission by id:', error);
        res.status(500).json({ message: 'Error fetching submission.' });
    }
});


// =======================================================
//  INTERNAL LOOKUP (SECTION SAFE)
// =======================================================
router.get('/:sessionId/:studentId', protect, async (req, res) => {
    try {
        const session = await LabSession.findById(req.params.sessionId);

        const submission = await Submission.findOne({
            session: req.params.sessionId,
            student: req.params.studentId,
            section: session.section
        });

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }

        res.json({ submission });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching submission details.' });
    }
});

// =======================================================
// FACULTY: GRADE SUBMISSION (SECTION SAFE)
// =======================================================
router.put('/grade/:submissionId', protect, restrictTo('Faculty'), async (req, res) => {
    const { marks, feedback } = req.body;

    try {
        const submission = await Submission.findById(req.params.submissionId)
            .populate({
                path: 'course',
                select: 'faculty'
            })
            .populate('session');

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }

        if (submission.course.faculty.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to grade this submission.' });
        }

        const session = submission.session;

        if (marks > session.maxMarks || marks < 0) {
            return res.status(400).json({ 
                message: `Marks must be between 0 and ${session.maxMarks}.` 
            });
        }

        submission.marks = marks;
        submission.feedback = feedback;
        submission.isReviewed = true;

        await submission.save();

        res.json({ message: 'Submission graded successfully.', submission });

    } catch (error) {
        console.error('Error grading submission:', error);
        res.status(500).json({ message: 'Error grading submission.' });
    }
});

module.exports = router;
