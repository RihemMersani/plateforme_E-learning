const express = require('express');
const { pool } = require('../config/db');
const auth = require('../middleware/auth');
const { idFromSlug, withSlug } = require('../utils/slug');

const router = express.Router();

const getCourse = async (id) => {
  const [courses] = await pool.execute(
    `SELECT c.*, u.full_name AS teacher_name,
      COUNT(DISTINCT l.id) AS lessons_count,
      COALESCE(SUM(l.duration_minutes), 0) AS duration_minutes
     FROM courses c
     LEFT JOIN users u ON u.id = c.teacher_id
     LEFT JOIN chapters ch ON ch.course_id = c.id
     LEFT JOIN lessons l ON l.chapter_id = ch.id
     WHERE c.id = ?
     GROUP BY c.id`,
    [id]
  );

  return courses[0] ? withSlug(courses[0]) : null;
};

router.get('/', async (req, res) => {
  try {
    const [courses] = await pool.execute(
      `SELECT c.*, u.full_name AS teacher_name,
        COUNT(DISTINCT l.id) AS lessons_count,
        COALESCE(SUM(l.duration_minutes), 0) AS duration_minutes
       FROM courses c
       LEFT JOIN users u ON u.id = c.teacher_id
       LEFT JOIN chapters ch ON ch.course_id = c.id
       LEFT JOIN lessons l ON l.chapter_id = ch.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    );

    res.json(courses.map(withSlug));
  } catch (err) {
    console.error('Courses list error:', err);
    res.status(500).json({ msg: 'Server error while loading courses' });
  }
});

router.get('/:slug', async (req, res) => {
  const courseId = idFromSlug(req.params.slug);
  if (!courseId) return res.status(404).json({ msg: 'Course not found' });

  try {
    const course = await getCourse(courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const [chapters] = await pool.execute(
      `SELECT ch.*, l.id AS lesson_id, l.title AS lesson_title, l.content,
        l.video_url, l.document_url, l.duration_minutes, l.position AS lesson_position
       FROM chapters ch
       LEFT JOIN lessons l ON l.chapter_id = ch.id
       WHERE ch.course_id = ?
       ORDER BY ch.position, l.position`,
      [courseId]
    );

    const grouped = [];
    for (const row of chapters) {
      let chapter = grouped.find((item) => item.id === row.id);
      if (!chapter) {
        chapter = {
          id: row.id,
          title: row.title,
          description: row.description,
          position: row.position,
          lessons: [],
        };
        grouped.push(chapter);
      }

      if (row.lesson_id) {
        chapter.lessons.push({
          id: row.lesson_id,
          title: row.lesson_title,
          content: row.content,
          video_url: row.video_url,
          document_url: row.document_url,
          duration_minutes: row.duration_minutes,
          position: row.lesson_position,
        });
      }
    }

    res.json({ ...course, chapters: grouped });
  } catch (err) {
    console.error('Course detail error:', err);
    res.status(500).json({ msg: 'Server error while loading course' });
  }
});

router.post('/:slug/enroll', auth, async (req, res) => {
  const courseId = idFromSlug(req.params.slug);
  if (!courseId) return res.status(404).json({ msg: 'Course not found' });

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? LIMIT 1',
      [req.user.id, courseId]
    );

    if (existing.length === 0) {
      await pool.execute(
        'INSERT INTO enrollments (student_id, course_id, progress, status) VALUES (?, ?, 0, ?)',
        [req.user.id, courseId, 'in_progress']
      );
    }

    res.json({ msg: 'Enrollment ready' });
  } catch (err) {
    console.error('Enroll error:', err);
    res.status(500).json({ msg: 'Server error while enrolling' });
  }
});

router.post('/:slug/lessons/:lessonId/complete', auth, async (req, res) => {
  const lessonId = Number(req.params.lessonId);
  const courseId = idFromSlug(req.params.slug);

  if (!courseId || !lessonId) return res.status(404).json({ msg: 'Lesson not found' });

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM lesson_progress WHERE student_id = ? AND lesson_id = ? LIMIT 1',
      [req.user.id, lessonId]
    );

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE lesson_progress SET is_completed = 1, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
        [existing[0].id]
      );
    } else {
      await pool.execute(
        'INSERT INTO lesson_progress (student_id, lesson_id, is_completed, completed_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP)',
        [req.user.id, lessonId]
      );
    }

    const [stats] = await pool.execute(
      `SELECT COUNT(l.id) AS total_lessons,
        SUM(CASE WHEN lp.is_completed = 1 THEN 1 ELSE 0 END) AS completed_lessons
       FROM lessons l
       JOIN chapters ch ON ch.id = l.chapter_id
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = ?
       WHERE ch.course_id = ?`,
      [req.user.id, courseId]
    );
    const total = Number(stats[0].total_lessons || 0);
    const completed = Number(stats[0].completed_lessons || 0);
    const progress = total ? Math.round((completed / total) * 100) : 0;

    await pool.execute(
      `UPDATE enrollments
       SET progress = ?, status = ?
       WHERE student_id = ? AND course_id = ?`,
      [progress, progress >= 100 ? 'completed' : 'in_progress', req.user.id, courseId]
    );

    res.json({ progress, completedLessons: completed, totalLessons: total });
  } catch (err) {
    console.error('Complete lesson error:', err);
    res.status(500).json({ msg: 'Server error while saving progress' });
  }
});

module.exports = router;
