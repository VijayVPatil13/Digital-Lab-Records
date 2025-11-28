// server/controllers/authController.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const asyncHandler = require('express-async-handler'); // Assuming this import exists

const generateToken = (id, role, fullName) => {
    // NOTE: Ensure process.env.JWT_SECRET is set
    return jwt.sign({ id, role, fullName }, process.env.JWT_SECRET || 'jwt_secret_key', {
        expiresIn: '30d', 
    });
};

exports.registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, role } = req.body; 

    if (!fullName || !email || !password || !role) {
        return res.status(400).json({ message: 'Please enter all fields.' });
    }
    // Security check: Only allow public registration for Students now
    if (!['Student'].includes(role)) {
        return res.status(403).json({ message: 'Only Student accounts can be registered publicly. Faculty/Admin accounts must be created by an administrator.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        // --- FIX: Robustly split fullName to satisfy required schema fields ---
        const names = fullName.trim().split(/\s+/);
        const firstName = names[0] || 'User';
        
        // CRITICAL FIX: If only one name is provided (names.length <= 1), 
        // use 'User' as a placeholder for lastName to satisfy the Mongoose required validation.
        const lastName = names.length > 1 ? names.slice(1).join(' ') : 'User'; 
        // -------------------------------------------------------------------------------------

        const newUser = await User.create({ 
            firstName, 
            lastName, 
            email, 
            passwordHash: password, // Mapped to passwordHash for hashing hook
            role, 
            enrolledCourses: [], 
        }); 

        res.status(201).json({
            user: {
                id: newUser._id,
                fullName: newUser.fullName, 
                email: newUser.email,
                role: newUser.role,
            },
            token: generateToken(newUser._id, newUser.role, newUser.fullName),
            message: `${newUser.role} registered and logged in successfully!`
        });

    } catch (error) {
        console.error("REGISTRATION FAILED:", error);
        // Display validation errors clearly if they aren't caught by the split logic
        const message = error.errors ? 'Validation failed: Check required fields.' : 'Server error during registration. Check logs.';
        res.status(500).json({ message });
    }
});

// Admin login using hard-coded credentials (creates admin user on first login)
exports.adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const ADMIN_EMAIL = 'admin@dlr.com';
    const ADMIN_PASSWORD = 'admin.dlr';

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    // Ensure admin user exists in DB
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });
    if (!adminUser) {
        const names = 'Admin DLR'.split(' ');
        adminUser = await User.create({
            firstName: names[0],
            lastName: names.slice(1).join(' '),
            email: ADMIN_EMAIL,
            passwordHash: ADMIN_PASSWORD,
            role: 'Admin'
        });
    }

    res.json({
        user: { id: adminUser._id, fullName: adminUser.fullName, email: adminUser.email, role: adminUser.role },
        token: generateToken(adminUser._id, adminUser.role, adminUser.fullName),
        message: 'Admin login successful.'
    });
});

// Admin-only: register another admin
exports.registerAdmin = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists.' });

    const names = fullName.trim().split(/\s+/);
    const firstName = names[0] || 'Admin';
    const lastName = names.length > 1 ? names.slice(1).join(' ') : 'Admin';

    const newAdmin = await User.create({ firstName, lastName, email, passwordHash: password, role: 'Admin' });

    res.status(201).json({ user: { id: newAdmin._id, fullName: newAdmin.fullName, email: newAdmin.email, role: newAdmin.role }, message: 'Admin account created.' });
});

exports.loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+passwordHash'); 

        if (user && (await user.matchPassword(password))) {
            res.json({
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                },
                token: generateToken(user._id, user.role, user.fullName), 
                message: 'Login successful'
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials (email or password)' });
        }
    } catch (error) {
        console.error('SERVER ERROR DURING LOGIN:', error);
        res.status(500).json({ message: 'Server error during login. Check server logs.' }); 
    }
});