// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware'); 

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// --- Import Route Handlers ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const studentRoutes = require('./routes/studentRoutes');

// ---------------------------------
// ROUTES
// ---------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/student', studentRoutes);

app.get('/', (req, res) => {
    res.send('Digital Lab Records API is running...');
});

// ---------------------------------
// ERROR MIDDLEWARE
// ---------------------------------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));