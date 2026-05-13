const express = require('express');
const { pool } = require('../config/db');
const auth = require('../middleware/auth');
const { withSlug } = require('../utils/slug');

const router = express.Router();

router.use(auth);

router.get('/dashboard', async (req, res) => {
  try {
    const [[summary]] = await pool.execute(
      `SELECT
        COALESCE(ROUND(AVG(progress)), 0) AS global_progress,
        COUNT(*) AS active_courses,
        SUM(status = 'completed') AS completed_courses
       FROM enrollments
       WHERE student_id = ?`,
      [req.user.id]
    );
    const [[quizSummary]] = await pool.execute(
      `SELECT COUNT(DISTINCT quiz_id) AS quizzes_done,
        SUM(passed = 1) AS quizzes_passed
       FROM quiz_results
       WHERE student_id = ?`,
      [req.user.id]
    );
    const [[certificateSummary]] = await pool.execute(
      'SELECT COUNT(*) AS certificates_count FROM certificates WHERE student_id = ?',
      [req.user.id]
    );
    const [courses] = await pool.execute(
      `SELECT c.*, e.progress
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.student_id = ?
       ORDER BY e.enrolled_at DESC
       LIMIT 3`,
      [req.user.id]
    );
    const [quizzes] = await pool.execute(
      `SELECT q.*, c.title AS course_title
       FROM quizzes q
       JOIN courses c ON c.id = q.course_id
       LEFT JOIN quiz_results qr ON qr.quiz_id = q.id AND qr.student_id = ?
       WHERE qr.id IS NULL
       ORDER BY q.created_at DESC
       LIMIT 3`,
      [req.user.id]
    );

    res.json({
      summary: {
        ...summary,
        quizzes_done: quizSummary.quizzes_done || 0,
        quizzes_passed: quizSummary.quizzes_passed || 0,
        certificates_count: certificateSummary.certificates_count || 0,
      },
      courses: courses.map(withSlug),
      quizzes: quizzes.map(withSlug),
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ msg: 'Server error while loading dashboard' });
  }
});

router.get('/courses', async (req, res) => {
  try {
    const [courses] = await pool.execute(
      `SELECT c.*, e.progress, e.status, e.enrolled_at
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.student_id = ?
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );
    res.json(courses.map(withSlug));
  } catch (err) {
    console.error('Student courses error:', err);
    res.status(500).json({ msg: 'Server error while loading student courses' });
  }
});

router.get('/quizzes', async (req, res) => {
  try {
    const [results] = await pool.execute(
      `SELECT qr.*, q.title, c.title AS course_title
       FROM quiz_results qr
       JOIN quizzes q ON q.id = qr.quiz_id
       JOIN courses c ON c.id = q.course_id
       WHERE qr.student_id = ?
       ORDER BY qr.submitted_at DESC`,
      [req.user.id]
    );
    res.json(results.map(withSlug));
  } catch (err) {
    console.error('Student quizzes error:', err);
    res.status(500).json({ msg: 'Server error while loading student quizzes' });
  }
});

router.get('/certificates', async (req, res) => {
  try {
    const [certificates] = await pool.execute(
      `SELECT cert.*, c.title
       FROM certificates cert
       JOIN courses c ON c.id = cert.course_id
       WHERE cert.student_id = ?
       ORDER BY cert.issued_at DESC`,
      [req.user.id]
    );
    res.json(certificates.map(withSlug));
  } catch (err) {
    console.error('Student certificates error:', err);
    res.status(500).json({ msg: 'Server error while loading student certificates' });
  }
});

module.exports = router;
