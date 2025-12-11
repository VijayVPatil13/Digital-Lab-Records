const express = require('express');
const router = express.Router();

// --- CRITICAL DEPENDENCY IMPORTS ---
const protect = require('../middleware/auth.js');
const { restrictTo } = require('../middleware/roles.js');
const Course = require('../models/Course.js');
const User = require('../models/User.js');
const LabSession = require('../models/LabSession.js');
const Submission = require('../models/Submission.js');
const Enrollment = require('../models/Enrollment.js');

// Apply middleware to all routes in this router
router.use(protect, restrictTo('Student'));

// --- 1. POST /enroll (NOW SUPPORTS COURSE + SECTION)
router.post('/enroll', async (req, res) => {
    const { courseCode, section } = req.body;
    const studentId = req.user.id;

    if (!courseCode || !section) {
        return res.status(400).json({ message: 'Course code and section are required.' });
    }

    try {
        const normalizedCode = courseCode.toUpperCase().trim();
        const normalizedSection = section.toUpperCase().trim();

        const course = await Course.findOne({
            code: normalizedCode,
            section: normalizedSection
        });

        if (!course) {
            return res.status(404).json({
                message: `Course ${normalizedCode} - Section ${normalizedSection} not found.`
            });
        }

        const existingEnrollment = await Enrollment.findOne({
            course: course._id,
            student: studentId,
            section: normalizedSection
        });

        if (existingEnrollment) {
            const statusMessage =
                existingEnrollment.status === 'approved'
                    ? 'You are already enrolled in this course and section.'
                    : 'Your enrollment request is already pending approval for this section.';
            return res.status(409).json({ message: statusMessage });
        }

        const newRequest = new Enrollment({
            course: course._id,
            student: studentId,
            section: normalizedSection,
            status: 'pending',
        });

        await newRequest.save();

        res.status(201).json({
            message: `Enrollment request for ${course.name} (Section ${normalizedSection}) submitted. Waiting for approval.`,
        });

    } catch (error) {
        console.error('Error handling enrollment:', error.message);
        res.status(500).json({ message: 'Server error during enrollment.' });
    }
});


// --- 2. GET /courses/enrolled (SECTION-AWARE)
router.get('/courses/enrolled', async (req, res) => {
    try {
        const studentId = req.user.id;

        const enrollments = await Enrollment.find({
            student: studentId,
            status: 'approved'
        }).populate({
            path: 'course',
            select: 'name code description faculty students',
            populate: {
                path: 'faculty',
                select: 'firstName lastName'
            }
        });

        const courses = enrollments.map(e => ({
            ...e.course.toObject(),
            section: e.section || e.course.section || '-'   
        }));


        res.status(200).json({ courses });

    } catch (error) {
        console.error('Error fetching student courses:', error.message);
        res.status(500).json({ message: 'Failed to retrieve enrolled courses.' });
    }
});

// --- 3. GET /labs/:courseCode (UNCHANGED)
// --- 3. GET /labs/:courseCode (NOW SECTION-SAFE)
router.get('/labs/:courseCode/:section', async (req, res) => {
  try {
    const studentId = req.user.id;
    const courseCode = req.params.courseCode.toUpperCase();
    const section = req.params.section.toUpperCase();

    // ✅ 1. FIND EXACT ENROLLMENT (COURSE + SECTION)
    const enrollment = await Enrollment.findOne({
      student: studentId,
      section: section,
      status: 'approved'
    }).populate('course');

    if (!enrollment || enrollment.course.code !== courseCode) {
      return res.status(403).json({
        message: 'Not enrolled in this course and section.'
      });
    }

    const { course } = enrollment;

    // ✅ 2. FETCH LAB SESSIONS (SAFE EVEN IF EMPTY)
    const sessions = await LabSession.find({
      course: course._id,
      section: section
    }).sort({ date: 1 });

    // ✅ 3. FETCH SUBMISSIONS
    const submissions = await Submission.find({
      student: studentId,
      session: { $in: sessions.map(s => s._id) },
      section: section
    });

    // ✅ 4. MAP LAB STATUS
    const labs = sessions.map(session => {
      const submission = submissions.find(sub =>
        sub.session.equals(session._id)
      );

      return {
        ...session.toObject(),
        submissionStatus: submission ? 'Submitted' : 'Pending',
        submissionDetails: submission
          ? {
              marks: submission.marks,
              feedback: submission.feedback,
              submittedAt: submission.submittedAt,
              submittedCode: submission.submittedCode,
              sessionId: session._id,
              submissionId: submission._id
            }
          : {
              sessionId: session._id,
              submissionId: null
            }
      };
    });

    res.json({ course, section, labs });

  } catch (error) {
    console.error('Error fetching student labs:', error);
    res.status(500).json({ message: 'Error fetching lab sessions.' });
  }
});


module.exports = router;
