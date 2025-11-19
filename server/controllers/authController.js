// server/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id, role) => {
  const expiration = process.env.JWT_EXPIRATION_TIME || '1d';
  
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: expiration, 
  });
};

exports.registerUser = async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ message: 'Please enter all fields.' });
    }
    if (role === 'Admin') {
        return res.status(403).json({ message: 'Admin accounts cannot be registered publicly.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            firstName, lastName, email, passwordHash, role, enrolledCourses: [],
        });

        res.status(201).json({
            id: newUser._id, email: newUser.email, role: newUser.role,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,   
        lastName: user.lastName,     
        token: generateToken(user._id, user.role), 
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials (email or password)' });
    }
  } catch (error) {
    console.error('SERVER ERROR DURING LOGIN:', error);
    res.status(500).json({ message: 'Server error during login. Check server logs.' }); 
  }
};