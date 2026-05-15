const express = require('express');
const { pool } = require('../config/db');
const auth = require('../middleware/auth');
const { idFromSlug, withSlug } = require('../utils/slug');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [quizzes] = await pool.execute(
      `SELECT q.*, LEAST(q.passing_score, 50) AS passing_score, c.title AS course_title, COUNT(ques.id) AS questions_count
       FROM quizzes q
       JOIN courses c ON c.id = q.course_id
       LEFT JOIN questions ques ON ques.quiz_id = q.id
       GROUP BY q.id
       ORDER BY q.created_at DESC`
    );

    res.json(quizzes.map(withSlug));
  } catch (err) {
    console.error('Quiz list error:', err);
    res.status(500).json({ msg: 'Server error while loading quizzes' });
  }
});

router.get('/:slug', async (req, res) => {
  const quizId = idFromSlug(req.params.slug);
  if (!quizId) return res.status(404).json({ msg: 'Quiz not found' });

  try {
    const [quizzes] = await pool.execute(
      `SELECT q.*, LEAST(q.passing_score, 50) AS passing_score, c.title AS course_title
       FROM quizzes q
       JOIN courses c ON c.id = q.course_id
       WHERE q.id = ?
       LIMIT 1`,
      [quizId]
    );

    if (!quizzes[0]) return res.status(404).json({ msg: 'Quiz not found' });

    const [rows] = await pool.execute(
      `SELECT ques.id AS question_id, ques.question_text,
        a.id AS answer_id, a.answer_text
       FROM questions ques
       JOIN answers a ON a.question_id = ques.id
       WHERE ques.quiz_id = ?
       ORDER BY ques.id, a.id`,
      [quizId]
    );

    const questions = [];
    for (const row of rows) {
      let question = questions.find((item) => item.id === row.question_id);
      if (!question) {
        question = { id: row.question_id, question_text: row.question_text, answers: [] };
        questions.push(question);
      }
      question.answers.push({ id: row.answer_id, answer_text: row.answer_text });
    }

    res.json({ ...withSlug(quizzes[0]), questions });
  } catch (err) {
    console.error('Quiz detail error:', err);
    res.status(500).json({ msg: 'Server error while loading quiz' });
  }
});

router.post('/:slug/submit', auth, async (req, res) => {
  const quizId = idFromSlug(req.params.slug);
  const submittedAnswers = req.body.answers || {};

  if (!quizId) return res.status(404).json({ msg: 'Quiz not found' });

  try {
    const [questions] = await pool.execute(
      'SELECT id FROM questions WHERE quiz_id = ?',
      [quizId]
    );
    const [correctAnswers] = await pool.execute(
      `SELECT question_id, id
       FROM answers
       WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ?) AND is_correct = 1`,
      [quizId]
    );
    const [quizzes] = await pool.execute(
      `SELECT q.passing_score, q.course_id
       FROM quizzes q
       WHERE q.id = ?
       LIMIT 1`,
      [quizId]
    );

    const correctByQuestion = new Map(correctAnswers.map((answer) => [answer.question_id, answer.id]));
    const total = questions.length;
    const correct = questions.filter((question) => Number(submittedAnswers[question.id]) === correctByQuestion.get(question.id)).length;
    const score = total ? Math.round((correct / total) * 100) : 0;
    const passingScore = 50;
    const passed = score >= passingScore;

    await pool.execute(
      'INSERT INTO quiz_results (student_id, quiz_id, score, passed) VALUES (?, ?, ?, ?)',
      [req.user.id, quizId, score, passed ? 1 : 0]
    );

    let certificateIssued = false;

    if (passed && quizzes[0]?.course_id) {
      const [progress] = await pool.execute(
        `SELECT COUNT(l.id) AS total_lessons,
          SUM(CASE WHEN lp.is_completed = 1 THEN 1 ELSE 0 END) AS completed_lessons
         FROM lessons l
         JOIN chapters ch ON ch.id = l.chapter_id
         LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = ?
         WHERE ch.course_id = ?`,
        [req.user.id, quizzes[0].course_id]
      );
      const totalLessons = Number(progress[0].total_lessons || 0);
      const completedLessons = Number(progress[0].completed_lessons || 0);

      if (totalLessons > 0 && completedLessons >= totalLessons) {
        const [certificates] = await pool.execute(
          'SELECT id FROM certificates WHERE student_id = ? AND course_id = ? LIMIT 1',
          [req.user.id, quizzes[0].course_id]
        );

        if (certificates.length === 0) {
          await pool.execute(
            'INSERT INTO certificates (student_id, course_id) VALUES (?, ?)',
            [req.user.id, quizzes[0].course_id]
          );
        }

        certificateIssued = true;
      }
    }

    res.json({ score, correct, total, passed, certificateIssued });
  } catch (err) {
    console.error('Quiz submit error:', err);
    res.status(500).json({ msg: 'Server error while submitting quiz' });
  }
});

router.get('/:slug/result', auth, async (req, res) => {
  const quizId = idFromSlug(req.params.slug);
  if (!quizId) return res.status(404).json({ msg: 'Quiz not found' });

  try {
    const [results] = await pool.execute(
      `SELECT qr.*, q.title, LEAST(q.passing_score, 50) AS passing_score, c.title AS course_title
       FROM quiz_results qr
       JOIN quizzes q ON q.id = qr.quiz_id
       JOIN courses c ON c.id = q.course_id
       WHERE qr.student_id = ? AND qr.quiz_id = ?
       ORDER BY qr.submitted_at DESC
       LIMIT 1`,
      [req.user.id, quizId]
    );

    if (!results[0]) return res.status(404).json({ msg: 'No result for this quiz yet' });
    res.json(results[0]);
  } catch (err) {
    console.error('Quiz result error:', err);
    res.status(500).json({ msg: 'Server error while loading quiz result' });
  }
});

module.exports = router;
