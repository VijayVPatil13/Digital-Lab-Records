// server/utils/dummyData.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const LabSession = require('../models/LabSession');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lab-record-system';

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected for seeding.');

        await User.deleteMany({});
        await Course.deleteMany({});
        await LabSession.deleteMany({});
        await Submission.deleteMany({});
        await Enrollment.deleteMany({});
        console.log('Old data cleared.');

        // NOTE: The model stores fullName and hashes 'password'
        const facultyUser = new User({
            email: 'faculty@example.com',
            password: 'password123', 
            fullName: 'Dr. Priya Sharma',
            role: 'Faculty'
        });
        const student1 = new User({
            email: 'student1@example.com',
            password: 'password123',
            fullName: 'Amit Kumar',
            role: 'Student'
        });
        const student2 = new User({
            email: 'student2@example.com',
            password: 'password123',
            fullName: 'Neha Reddy',
            role: 'Student'
        });
        const adminUser = new User({
            email: 'admin@example.com',
            password: 'password123',
            fullName: 'Chief Admin',
            role: 'Admin'
        });

        await Promise.all([facultyUser.save(), student1.save(), student2.save(), adminUser.save()]);
        console.log('Users created.');

        // Course 1: Fully Enrolled by Enrollment/Course student lists
        const course1 = new Course({
            name: 'Advanced Data Structures',
            code: 'CSL37',
            faculty: facultyUser._id,
            description: 'Algorithms and advanced data structures like trees and graphs.',
            students: [student1._id]
        });
        // Course 2: Student2 is enrolled, student1 has pending enrollment via Enrollment model
        const course2 = new Course({
            name: 'Object-Oriented Programming',
            code: 'CSL21',
            faculty: facultyUser._id,
            description: 'Core concepts of OOP using Java/C++.',
            students: [student2._id]
        });

        await Promise.all([course1.save(), course2.save()]);
        console.log('Courses created.');

        // Manual Enrollment records for Course/User models:
        student1.enrolledCourses.push(course1._id, course2._id);
        student2.enrolledCourses.push(course2._id);
        await Promise.all([student1.save(), student2.save()]);

        // Create a PENDING Enrollment Request for student1 in CSL21
        const pendingEnrollment = new Enrollment({
            course: course2._id,
            student: student1._id,
            status: 'pending',
        });
        await pendingEnrollment.save();
        console.log('Pending Enrollment created (Student1 in CSL21).');


        // Sessions and Submissions (for CSL37)
        const session1 = new LabSession({
            course: course1._id,
            title: 'Lab 1: Linked Lists',
            date: new Date('2025-11-01'),
            description: 'Implement a singly linked list.',
            maxMarks: 10
        });
        await session1.save();
        console.log('Lab Sessions created.');

        console.log('\nDatabase seeded successfully!');
    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

// seedDB(); // Run manually via 'npm run seed'