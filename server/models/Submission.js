// server/models/Submission.js
const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'LabSession', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submittedCode: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  marks: { type: Number, default: 0 },
  feedback: { type: String },
  isReviewed: { type: Boolean, default: false }
});

SubmissionSchema.index({ session: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);