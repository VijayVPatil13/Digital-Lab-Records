// server/routes/authRoutes.js
const express = require('express');
const { loginUser, registerUser, adminLogin, registerAdmin } = require('../controllers/authController'); 

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
// Admin-specific endpoints
router.post('/admin-login', adminLogin);
router.post('/register-admin', protect, restrictTo('Admin'), registerAdmin);

module.exports = router;