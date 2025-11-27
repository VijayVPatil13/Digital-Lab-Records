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
    // Security check: Only allow public registration for specific roles
    if (!['Faculty', 'Student'].includes(role)) {
        return res.status(403).json({ message: 'Admin accounts cannot be registered publicly.' });
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