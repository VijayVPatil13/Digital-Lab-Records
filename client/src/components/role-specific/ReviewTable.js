// // server/routes/studentRoutes.js

// const express = require('express');
// const router = express.Router();
// const Course = require('../models/Course'); 
// const Enrollment = require('../models/Enrollment'); 
// const LabSession = require('../models/LabSession'); 
// const Submission = require('../models/Submission'); 

// // --- 1. POST /enroll (Handles Join Course Request) ---
// router.post('/enroll', async (req, res) => {
//     const { courseCode, studentId } = req.body;
//     // ... (full logic for enrollment request) ...
// });

// // --- 2. GET /courses/enrolled/:studentId ---
// router.get('/courses/enrolled/:studentId', async (req, res) => {
//     // ... (full logic for fetching approved enrollments) ...
// });

// // --- 3. POST /submissions (Student Submits Code) ---
// router.post('/submissions', async (req, res) => {
//     const { sessionId, studentId, submittedCode } = req.body; 
//     // ... (full logic for saving submission) ...
// });

// // --- 4. GET /sessions/active/:courseId ---
// router.get('/sessions/active/:courseId', async (req, res) => {
//     // ... (full logic for fetching active sessions) ...
// });

// // module.exports = router;