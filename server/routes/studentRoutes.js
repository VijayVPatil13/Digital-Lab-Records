// server/routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const Course = require('../models/Course'); 
const Enrollment = require('../models/Enrollment'); 
// const { authenticate, isStudent } = require('../middleware/authMiddleware'); 

// 1. POST /enroll (Handles Join Course Request)
router.post('/enroll', /* authenticate, isStudent, */ async (req, res) => {
    const { courseCode, studentId } = req.body;
    
    if (!courseCode || !studentId) {
        return res.status(400).json({ message: 'Course ID and Student ID are required.' });
    }

    try {
        const course = await Course.findOne({ code: courseCode.toUpperCase() });
        if (!course) {
            return res.status(404).json({ message: `Course with ID ${courseCode} not found.` });
        }

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

// 2. GET /courses/enrolled/:studentId (Fetch enrolled courses - FIXES DISPLAY ON STUDENT DASHBOARD)
router.get('/courses/enrolled/:studentId', /* authenticate, isStudent, */ async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Finds approved enrollments
        const enrollments = await Enrollment.find({ 
            student: studentId, 
            status: 'approved' 
        }).populate({
            path: 'course', // Populate the Course data
            select: 'name code section facultyId', 
            populate: {
                path: 'facultyId', 
                select: 'fullName' // Populate faculty name
            }
        }); 

        // Formats data for the CourseCard component
        const courses = enrollments
            .map(e => {
                if (!e.course) return null;

                const facultyName = e.course.facultyId 
                    ? e.course.facultyId.fullName 
                    : 'N/A'; 

                return {
                    ...e.course.toObject(),
                    facultyName: facultyName,
                };
            })
            .filter(c => c !== null); 

        res.status(200).json({ courses });
    } catch (error) {
        console.error('Error fetching student courses:', error.message);
        res.status(500).json({ message: 'Failed to retrieve enrolled courses.' });
    }
});

module.exports = router;