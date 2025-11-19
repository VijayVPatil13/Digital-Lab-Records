const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Create a new Course and assign faculty
// @route   POST /api/admin/courses
// @access  Private (Admin)
exports.createCourse = async (req, res) => {
    const { name, code, section, facultyId } = req.body; 
    
    if (!name || !code || !facultyId) {
        return res.status(400).json({ message: 'Course Name, Code, and Faculty ID are required.' });
    }

    try {
        const courseExists = await Course.findOne({ code });
        if (courseExists) {
            return res.status(400).json({ message: `Course with code ${code} already exists.` });
        }
        
        const newCourse = await Course.create({
            name,
            code: code.toUpperCase(),
            section: section || 'N/A',
            facultyAssigned: [facultyId], 
        });

        await User.findByIdAndUpdate(facultyId, {
            $addToSet: { enrolledCourses: newCourse._id } 
        });
        
        res.status(201).json({
            message: `Course ${newCourse.name} created and faculty assigned.`,
            course: newCourse,
        });

    } catch (error) {
        console.error('Course Creation Error:', error);
        res.status(500).json({ message: 'Server error during course creation.' });
    }
};