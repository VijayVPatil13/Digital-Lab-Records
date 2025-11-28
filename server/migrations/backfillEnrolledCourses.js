// server/migrations/backfillEnrolledCourses.js
// Run this with: node server/migrations/backfillEnrolledCourses.js

require('dotenv').config();
const mongoose = require('mongoose');

const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Course = require('../models/Course');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/dlr';

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected.');

  try {
    // Find all approved enrollments
    const approved = await Enrollment.find({ status: 'approved' }).lean();
    console.log(`Found ${approved.length} approved enrollments.`);

    const stats = {
      usersUpdated: 0,
      coursesUpdated: 0,
      skippedUsers: 0,
      skippedCourses: 0
    };

    // Process sequentially to avoid overwhelming DB
    for (const en of approved) {
      const studentId = en.student;
      const courseId = en.course;

      // Add course to user's enrolledCourses
      const userUpdate = await User.updateOne(
        { _id: studentId },
        { $addToSet: { enrolledCourses: courseId } }
      );

      if (userUpdate.modifiedCount === 1) stats.usersUpdated++;
      else stats.skippedUsers++;

      // Ensure course.students includes the student
      const courseUpdate = await Course.updateOne(
        { _id: courseId },
        { $addToSet: { students: studentId } }
      );

      if (courseUpdate.modifiedCount === 1) stats.coursesUpdated++;
      else stats.skippedCourses++;
    }

    console.log('Migration complete. Summary:');
    console.log(stats);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
