// server/routes/facultyRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.js');
const { restrictTo } = require('../middleware/roles.js');
const { 
    getMyCourses, 
    createCourse, 
    createLabSession, 
    getSessionsByCourse, 
    getPendingEnrollments,
    approveAllEnrollments,
    updateEnrollmentStatus,
    getReviewData
} = require('../controllers/facultyController'); 

router.use(protect, restrictTo('Faculty')); 

// Course Management 
router.post('/courses', createCourse); 
router.get('/courses/taught', getMyCourses);

// Session and Enrollment Management
router.post('/sessions', createLabSession);
// This route now correctly references the imported function
router.get(
  '/sessions/course/:courseCode/:section',
  protect,
  restrictTo('Faculty'),
  getSessionsByCourse
);

router.get('/enrollment/pending', getPendingEnrollments);
router.put('/enrollment/:requestId', updateEnrollmentStatus);

// Review/Grading
router.get('/review/:sessionId', getReviewData);

// Bulk Enrollment Approval
router.post('/enrollment/approve-all', approveAllEnrollments);

module.exports = router;