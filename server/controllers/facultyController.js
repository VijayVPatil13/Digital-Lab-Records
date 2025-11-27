// server/controllers/facultyController.js

const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const LabSession = require('../models/LabSession');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// @desc    Get all courses taught by the logged-in faculty
// @route   GET /api/faculty/courses/taught
// @access  Private (Faculty)
exports.getMyCourses = asyncHandler(async (req, res) => {
    const facultyId = req.user.id; 

    const courses = await Course.find({ faculty: facultyId })
        .populate('faculty', 'firstName lastName')
        .populate('students', 'fullName email');
    
    const formattedCourses = courses.map(course => {
        const courseObj = course.toObject();
        const faculty = courseObj.faculty;
        const instructorName = faculty && faculty.firstName ? `${faculty.firstName} ${faculty.lastName || ''}`.trim() : req.user.fullName;
        
        return {
            ...courseObj,
            faculty: faculty,
            instructorName: instructorName,
            studentsCount: courseObj.students ? courseObj.students.length : 0
        };
    });

    res.json({ courses: formattedCourses });
});

// @desc    Create a new Course and assign faculty (Moved to Faculty Controller)
// @route   POST /api/faculty/courses
// @access  Private (Faculty)
exports.createCourse = asyncHandler(async (req, res) => {
    const { name, code, section, description } = req.body; 
    const facultyId = req.user.id; // Use ID from JWT/auth

    if (!name || !code) {
        res.status(400);
        throw new Error('Course Name and Code are required.');
    }

    const courseExists = await Course.findOne({ code: code.toUpperCase() });
    if (courseExists) {
        res.status(400);
        throw new Error(`Course with code ${code} already exists.`);
    }
    
    const newCourse = await Course.create({
        name,
        code: code.toUpperCase(),
        section: section || 'A',
        description,
        faculty: facultyId, // Assigns the course to the logged-in faculty
    });
    
    // Populate faculty data before returning
    const populatedCourse = await Course.findById(newCourse._id)
        .populate('faculty', 'firstName lastName')
        .populate('students', 'fullName email');
    
    res.status(201).json({
        message: `Course ${populatedCourse.name} created and assigned to you.`,
        course: populatedCourse,
    });
});

// @desc    Create a new Lab Session
// @route   POST /api/faculty/sessions
// @access  Private (Faculty)
exports.createLabSession = asyncHandler(async (req, res) => {
    const { courseCode, title, date, startTime, endTime, description, maxMarks } = req.body;
    const facultyId = req.user.id;

    const course = await Course.findOne({ code: courseCode.toUpperCase(), faculty: facultyId });
    if (!course) {
        res.status(404);
        throw new Error(`Course ${courseCode} not found or not assigned to this faculty.`);
    }

    const enrolledStudents = await Enrollment.find({ course: course._id, status: 'approved' }).select('student');
    const initialAttendance = enrolledStudents.map(e => e.student); 
    
    const newSession = await LabSession.create({
        course: course._id,
        title,
        date,
        startTime,
        endTime,
        description,
        maxMarks,
        attendance: initialAttendance,
    });
    
    res.status(201).json({ message: 'Lab session created successfully.', session: newSession });
});

// @desc    Fetch Sessions for a course
// @route   GET /api/faculty/sessions/course/:courseCode
// @access  Private (Faculty)
exports.getSessionsByCourse = asyncHandler(async (req, res) => {
    const { courseCode } = req.params;
    const facultyId = req.user.id;

    const course = await Course.findOne({ code: courseCode.toUpperCase(), faculty: facultyId });
    if (!course) {
        res.status(404);
        throw new Error('Course not found or faculty not assigned.');
    }

    const sessions = await LabSession.find({ course: course._id }).sort({ date: -1 });

    res.json({ course, sessions });
});


// @desc    Get All Pending Enrollment Requests
// @route   GET /api/faculty/enrollment/pending
// @access  Private (Faculty)
exports.getPendingEnrollments = asyncHandler(async (req, res) => {
    const facultyId = req.user.id;
    const courseIds = (await Course.find({ faculty: facultyId }, '_id')).map(c => c._id);

    const pendingRequests = await Enrollment.find({ 
        course: { $in: courseIds }, 
        status: 'pending' 
    })
    .populate('student', 'fullName email') 
    .populate('course', 'name code')
    .lean();
    
    res.json({ requests: pendingRequests });
});

// @desc    Approve/Reject Enrollment
// @route   PUT /api/faculty/enrollment/:requestId
// @access  Private (Faculty)
exports.updateEnrollmentStatus = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body; 
    const facultyId = req.user.id;

    const enrollment = await Enrollment.findById(requestId).populate('course', 'faculty');

    if (!enrollment || enrollment.course.faculty.toString() !== facultyId.toString()) {
        res.status(403);
        throw new Error('Not authorized or request not found.');
    }

    enrollment.status = status;
    const updatedEnrollment = await enrollment.save();

    if (status === 'approved') {
        await Course.findByIdAndUpdate(
            enrollment.course._id,
            { $addToSet: { students: enrollment.student } },
            { new: true }
        );
    }

    res.json({ message: 'Enrollment updated successfully', enrollment: updatedEnrollment });
});

// @desc    Get Detailed Review Data for a Session
// @route   GET /api/faculty/review/:sessionId
// @access  Private (Faculty)
exports.getReviewData = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const facultyId = req.user.id;

    const session = await LabSession.findById(sessionId).populate({
        path: 'course',
        select: 'faculty name code description students maxMarks' 
    }).lean(); 

    if (!session || session.course.faculty.toString() !== facultyId.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this session review.');
    }

    const enrolledStudents = await User.find({ enrolledCourses: session.course._id, role: 'Student' }, 'fullName email').lean();
    
    const SubmissionModel = require('../models/Submission');
    const submissions = await SubmissionModel.find({ session: sessionId }).lean();

    const submissionMap = submissions.reduce((map, sub) => {
        map[sub.student.toString()] = sub;
        return map;
    }, {});

    const reviewList = enrolledStudents.map(student => {
        const submission = submissionMap[student._id.toString()];
        return {
            student: student,
            submission: submission || { submittedCode: 'N/A', marks: null, feedback: '' },
            hasSubmitted: !!submission,
            attended: session.attendance.some(id => id.toString() === student._id.toString()),
        };
    });

    res.json({ session, reviewList });
});

module.exports = {
    getMyCourses: exports.getMyCourses,
    createCourse: exports.createCourse, // EXPORTED NEW FUNCTION
    createLabSession: exports.createLabSession,
    getSessionsByCourse: exports.getSessionsByCourse,
    getPendingEnrollments: exports.getPendingEnrollments,
    updateEnrollmentStatus: exports.updateEnrollmentStatus,
    getReviewData: exports.getReviewData
};