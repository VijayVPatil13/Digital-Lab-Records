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
        .lean();

    const courseIds = courses.map(c => c._id);

    // ✅ SECTION-WISE STUDENT COUNT FROM ENROLLMENT
    const enrollments = await Enrollment.find({
        course: { $in: courseIds },
        status: 'approved'
    });

    const formattedCourses = courses.map(course => {
        const faculty = course.faculty;
        const instructorName =
            faculty && faculty.firstName
                ? `${faculty.firstName} ${faculty.lastName || ''}`.trim()
                : req.user.fullName;

        const sectionStudents = enrollments.filter(
            e =>
                e.course.toString() === course._id.toString() &&
                e.section === course.section
        );

        return {
            ...course,
            instructorName,
            studentsCount: sectionStudents.length   // ✅ CORRECT COUNT PER SECTION
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

    const normalizedCode = code.toUpperCase();
    const normalizedSection = (section || 'A').toUpperCase();

    const courseExists = await Course.findOne({
        code: normalizedCode,
        section: normalizedSection
    });

    if (courseExists) {
        res.status(400);
        throw new Error(
            `Course with code ${normalizedCode} and section ${normalizedSection} already exists.`
        );
    }
    
    const newCourse = await Course.create({
        name,
        code: normalizedCode,
        section: normalizedSection,
        description,
        faculty: facultyId,
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
  const { courseCode, section, title, date, startTime, endTime, description, maxMarks } = req.body;
  const facultyId = req.user.id;

  if (!courseCode || !section) {
    res.status(400);
    throw new Error('Course code and section are required.');
  }

  const normalizedCode = courseCode.toUpperCase().trim();
  const normalizedSection = section.toUpperCase().trim();

  const course = await Course.findOne({
    code: normalizedCode,
    section: normalizedSection,
    faculty: facultyId
  });

  if (!course) {
    res.status(404);
    throw new Error(`Course ${normalizedCode} - Section ${normalizedSection} not found.`);
  }

  const enrolledStudents = await Enrollment.find({
    course: course._id,
    section: normalizedSection,
    status: 'approved'
  }).select('student');

  const initialAttendance = enrolledStudents.map(e => e.student);

  const newSession = await LabSession.create({
    course: course._id,
    section: normalizedSection,   
    title,
    date,
    startTime,
    endTime,
    description,
    maxMarks,
    attendance: initialAttendance
  });

  res.status(201).json({
    message: 'Lab session created successfully.',
    session: newSession
  });
});

// @desc    Fetch Sessions for a course (SECTION AWARE)
// @route   GET /api/faculty/sessions/course/:courseCode/:section
// @access  Private (Faculty)
exports.getSessionsByCourse = asyncHandler(async (req, res) => {
    const { courseCode, section } = req.params;
    const facultyId = req.user.id;

    const course = await Course.findOne({
        code: courseCode.toUpperCase(),
        section: section.toUpperCase(),
        faculty: facultyId
    });

    if (!course) {
        res.status(404);
        throw new Error('Course not found or faculty not assigned.');
    }

    const sessions = await LabSession.find({
        course: course._id,
        section: section.toUpperCase()
    }).sort({ date: -1 });

    res.json({ course, sessions });
});



// @desc    Get All Pending Enrollment Requests
// @route   GET /api/faculty/enrollment/pending
// @access  Private (Faculty)
exports.getPendingEnrollments = asyncHandler(async (req, res) => {
    const facultyId = req.user.id;

    const courseIds = (
        await Course.find({ faculty: facultyId }, '_id')
    ).map(c => c._id);

    const pendingRequests = await Enrollment.find({ 
        course: { $in: courseIds }, 
        status: 'pending' 
    })
    .populate('student', 'firstName lastName email usn')   
    .populate('course', 'name code section')
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

    const previousStatus = enrollment.status;
    enrollment.status = status;
    const updatedEnrollment = await enrollment.save();

    // If transitioning to approved, add student to course and user's enrolledCourses
    if (previousStatus !== 'approved' && status === 'approved') {
        await Course.findByIdAndUpdate(
            enrollment.course._id,
            { $addToSet: { students: enrollment.student } },
            { new: true }
        );

        await User.findByIdAndUpdate(
            enrollment.student,
            { $addToSet: { enrolledCourses: enrollment.course._id } }
        );
    }

    // If previously approved and now changed away from approved, remove from course and user's enrolledCourses
    if (previousStatus === 'approved' && status !== 'approved') {
        await Course.findByIdAndUpdate(
            enrollment.course._id,
            { $pull: { students: enrollment.student } },
            { new: true }
        );

        await User.findByIdAndUpdate(
            enrollment.student,
            { $pull: { enrolledCourses: enrollment.course._id } }
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

    // Get enrolled students from Enrollment model to ensure correct and up-to-date list
    const Enrollment = require('../models/Enrollment');
    const enrolledRecords = await Enrollment.find({ 
        course: session.course._id, 
        status: 'approved',
        section: session.section   
    })
    .populate('student', 'firstName lastName email usn')
    .lean();


    const SubmissionModel = require('../models/Submission');
    const submissions = await SubmissionModel.find({ session: sessionId }).lean();

    const submissionMap = submissions.reduce((map, sub) => {
        map[sub.student.toString()] = sub;
        return map;
    }, {});

    const reviewList = enrolledRecords.map(record => {
        const student = record.student;
        // Ensure fullName exists for backward compatibility
        if (!student.fullName) {
            student.fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
        }

        const submission = submissionMap[student._id.toString()];
        return {
            student: student,
            submission: submission || { _id: null, submittedCode: '', marks: null, feedback: '' },
            hasSubmitted: !!submission,
            attended: Array.isArray(session.attendance) ? session.attendance.some(id => id.toString() === student._id.toString()) : false,
        };
    });

    res.json({ session, reviewList });
});

// @desc    Approve all pending enrollments for this faculty
// @route   POST /api/faculty/enrollment/approve-all
// @access  Private (Faculty)
exports.approveAllEnrollments = asyncHandler(async (req, res) => {
    const facultyId = req.user.id;

    // Find all courses taught by this faculty
    const courseIds = (
        await Course.find({ faculty: facultyId }, '_id')
    ).map(c => c._id);

    // Find all pending enrollments
    const pending = await Enrollment.find({
        course: { $in: courseIds },
        status: 'pending'
    });

    if (pending.length === 0) {
        return res.json({ message: "No pending enrollments." });
    }

    // Update each enrollment
    for (const enrollment of pending) {
        enrollment.status = 'approved';
        await enrollment.save();

        await Course.findByIdAndUpdate(
            enrollment.course,
            { $addToSet: { students: enrollment.student } }
        );

        await User.findByIdAndUpdate(
            enrollment.student,
            { $addToSet: { enrolledCourses: enrollment.course } }
        );
    }

    res.json({ 
        message: "All Pending Enrollments Accepted", 
        count: pending.length 
    });
});


// @desc    Get enrolled students with average marks for a course (SECTION SAFE)
// @route   GET /api/faculty/courses/:courseCode/:section/students
// @access  Private (Faculty)
// @desc Get enrolled students with average marks (SOURCE: Course.students)
// @route GET /api/faculty/courses/:courseCode/:section/students
// @desc    Get enrolled students with avg marks & assignment count
// @route   GET /api/faculty/courses/:courseCode/:section/students
// @access  Private (Faculty)
exports.getEnrolledStudentsWithAverage = asyncHandler(async (req, res) => {
    const { courseCode, section } = req.params;
    const facultyId = req.user.id;

    // 1️⃣ Find course
    const course = await Course.findOne({
        code: courseCode.toUpperCase(),
        section: section.toUpperCase(),
        faculty: facultyId
    }).populate('students', 'firstName lastName fullName usn');

    if (!course) {
        res.status(404);
        throw new Error("Course not found or unauthorized");
    }

    const validStudents = (course.students || []).filter(Boolean);

    if (validStudents.length === 0) {
        return res.json({ students: [] });
    }

    const studentIds = validStudents.map(s => s._id);

    const Submission = require('../models/Submission');

    // 2️⃣ ONE aggregation for BOTH count and average
    const stats = await Submission.aggregate([
        {
            $match: {
                course: course._id,
                section: course.section,
                student: { $in: studentIds }
            }
        },
        {
            $group: {
                _id: "$student",
                assignmentsSubmitted: { $sum: 1 },
                totalMarks: { $sum: "$marks" }
            }
        },
        {
            $project: {
                assignmentsSubmitted: 1,
                averageMarks: {
                    $cond: [
                        { $eq: ["$assignmentsSubmitted", 0] },
                        0,
                        { $divide: ["$totalMarks", "$assignmentsSubmitted"] }
                    ]
                }
            }
        }
    ]);

    // 3️⃣ Build lookup map
    const statsMap = {};
    stats.forEach(s => {
        statsMap[s._id.toString()] = {
            assignmentsSubmitted: s.assignmentsSubmitted,
            averageMarks: Number(s.averageMarks.toFixed(2))
        };
    });

    // 4️⃣ FINAL response (ONLY from statsMap)
    const result = validStudents.map(s => {
        const stat = statsMap[s._id.toString()] || {
            assignmentsSubmitted: 0,
            averageMarks: 0
        };

        return {
            usn: s.usn,
            name: s.fullName || `${s.firstName} ${s.lastName}`,
            section: course.section,
            assignmentsSubmitted: stat.assignmentsSubmitted,
            averageMarks: stat.averageMarks
        };
    });

    res.json({ students: result });
});



module.exports = {
    getMyCourses: exports.getMyCourses,
    createCourse: exports.createCourse, 
    createLabSession: exports.createLabSession,
    getSessionsByCourse: exports.getSessionsByCourse,
    getPendingEnrollments: exports.getPendingEnrollments,
    updateEnrollmentStatus: exports.updateEnrollmentStatus,
    getReviewData: exports.getReviewData,
    getEnrolledStudentsWithAverage: exports.getEnrolledStudentsWithAverage,
    approveAllEnrollments: exports.approveAllEnrollments,
};