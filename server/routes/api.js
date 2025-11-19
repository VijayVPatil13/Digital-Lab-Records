// server/controller/routes/api.js

const express = require('express');
const router = express.Router();

// 1. Import your specific route files
const authRoutes = require('./authRoutes');      // Assuming for /api/auth
const facultyRoutes = require('./facultyRoutes'); // For /api/faculty
const studentRoutes = require('./studentRoutes');   // For /api/student
const adminRoutes = require('./adminRoutes');      // For /api/admin

// 2. Register the route handlers with specific path prefixes
// Note: We don't need the leading /api/ here, as it will be applied 
// in server/server.js when this file is registered.

// Handles all routes prefixed with /api/auth
router.use('/auth', authRoutes);

// Handles all routes prefixed with /api/faculty (Fixes 404 for course creation)
router.use('/faculty', facultyRoutes);

// Handles all routes prefixed with /api/student (Fixes 404 for enrollment)
router.use('/student', studentRoutes);

// Handles all routes prefixed with /api/admin
router.use('/admin', adminRoutes);

// Export the router to be used by the main server file
module.exports = router;