// server/routes/authRoutes.js
const express = require('express');
const { loginUser, registerUser, adminLogin, registerAdmin, registerFaculty, listFaculty, deleteFaculty } = require('../controllers/authController'); 
const protect = require('../middleware/auth.js');
const { restrictTo } = require('../middleware/roles.js');

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
// Admin-specific endpoints
router.post('/admin-login', adminLogin);
router.post('/register-admin', protect, restrictTo('Admin'), registerAdmin);
// Admin can register, list, and delete faculty accounts
router.post('/register-faculty', protect, restrictTo('Admin'), registerFaculty);
router.get('/list-faculty', protect, restrictTo('Admin'), listFaculty);
router.delete('/delete-faculty/:facultyId', protect, restrictTo('Admin'), deleteFaculty);

module.exports = router;