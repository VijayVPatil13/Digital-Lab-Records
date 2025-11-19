// server/routes/adminRoutes.js
const express = require('express');
const protect = require('../middleware/authMiddleware'); 
const { isAdmin } = require('../middleware/roleMiddleware'); 
const { createCourse } = require('../controllers/adminController'); // <-- ENSURE THIS IMPORT IS CORRECT

const router = express.Router();

router.use(protect);
router.use(isAdmin); 

// Endpoint: POST /api/admin/courses 
router.post('/courses', createCourse); // Use the real controller function

// Example 2: Enroll faculty member (POST /api/admin/enrollfaculty)
router.post('/enrollfaculty', (req, res) => {
    res.json({ message: "Faculty enrollment endpoint (Admin only)" });
});

module.exports = router;