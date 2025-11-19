// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Faculty', 'Student'], required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

module.exports = mongoose.model('User', UserSchema);