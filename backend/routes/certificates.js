const express = require('express');
const { pool } = require('../config/db');
const auth = require('../middleware/auth');
const { idFromSlug, withSlug } = require('../utils/slug');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const [certificates] = await pool.execute(
      `SELECT cert.*, c.title, u.full_name
       FROM certificates cert
       JOIN courses c ON c.id = cert.course_id
       JOIN users u ON u.id = cert.student_id
       WHERE cert.student_id = ?
       ORDER BY cert.issued_at DESC`,
      [req.user.id]
    );

    const [inProgress] = await pool.execute(
      `SELECT c.id, c.title, e.progress
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN certificates cert ON cert.course_id = c.id AND cert.student_id = e.student_id
       WHERE e.student_id = ? AND cert.id IS NULL
       ORDER BY e.progress DESC`,
      [req.user.id]
    );

    res.json({
      earned: certificates.map(withSlug),
      inProgress: inProgress.map(withSlug),
    });
  } catch (err) {
    console.error('Certificates list error:', err);
    res.status(500).json({ msg: 'Server error while loading certificates' });
  }
});

router.get('/:slug', async (req, res) => {
  const courseId = idFromSlug(req.params.slug);
  if (!courseId) return res.status(404).json({ msg: 'Certificate not found' });

  try {
    const [certificates] = await pool.execute(
      `SELECT cert.*, c.title, u.full_name
       FROM certificates cert
       JOIN courses c ON c.id = cert.course_id
       JOIN users u ON u.id = cert.student_id
       WHERE cert.student_id = ? AND cert.course_id = ?
       LIMIT 1`,
      [req.user.id, courseId]
    );

    if (!certificates[0]) return res.status(404).json({ msg: 'Certificate not found yet' });
    res.json(withSlug(certificates[0]));
  } catch (err) {
    console.error('Certificate detail error:', err);
    res.status(500).json({ msg: 'Server error while loading certificate' });
  }
});

module.exports = router;
