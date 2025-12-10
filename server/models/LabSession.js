const mongoose = require('mongoose');

const LabSessionSchema = new mongoose.Schema({
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },

  // SECTION ADDED
  section: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },

  title: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  description: { type: String },
  maxMarks: { type: Number, default: 10 },

  attendance: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
});

// FAST SECTION-BASED LOOKUP
LabSessionSchema.index({ course: 1, section: 1 });

module.exports = mongoose.model('LabSession', LabSessionSchema);
