// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['Faculty', 'Student'], required: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

UserSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.passwordHash) return false;
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};

UserSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) { 
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);