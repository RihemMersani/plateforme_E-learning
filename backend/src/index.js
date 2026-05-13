const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/auth');
const certificateRoutes = require('../routes/certificates');
const courseRoutes = require('../routes/courses');
const quizRoutes = require('../routes/quizzes');
const studentRoutes = require('../routes/student');
const { testConnection } = require('../config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/student', studentRoutes);

// Database connection
testConnection()
  .then(() => console.log('MySQL connected'))
  .catch(err => {
    console.error('MySQL connection failed:', err.message);
    console.error('Start MySQL in XAMPP and verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME.');
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
