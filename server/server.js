// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Route Imports
const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/course'); 
const submissionRoutes = require('./routes/submission'); 
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors({
  origin: "*", // or specific IPs: [ "http://<client-ip>:3000" ]
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Database Connection
const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/submissions', submissionRoutes);

// Test route
app.get('/api', (req, res) => {
  res.send('Digital Lab Records API Running');
});

// Error Handling Middleware (MUST be last)
app.use(notFound);
app.use(errorHandler);

// Port and Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, '10.20.50.251', () => {
  console.log(`Server running on http://10.20.50.251:${PORT}`);
});