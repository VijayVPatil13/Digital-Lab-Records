// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.js'); // Correct path/export for protect
const { restrictTo } = require('../middleware/roles.js'); 
const { createCourse } = require('../controllers/adminController'); 

// Apply protection and role restriction to all admin routes
router.use(protect);
router.use(restrictTo('Admin')); 

// Endpoint: POST /api/admin/courses (Calls Admin Controller logic)
router.post('/courses', createCourse); 

// Example 2: Enroll faculty member (POST /api/admin/enrollfaculty)
router.post('/enrollfaculty', (req, res) => {
    res.json({ message: "Faculty enrollment endpoint (Admin only)" });
});

module.exports = router;