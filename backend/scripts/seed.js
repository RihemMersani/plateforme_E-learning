const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const courses = [
  {
    title: 'Angular avec style',
    description: 'Construis une application Angular moderne avec composants, routing, formulaires et appels API.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80',
    level: 'Intermediaire',
    price: 0,
    chapters: [
      {
        title: 'Fondations Angular',
        description: 'Comprendre la structure du projet et les composants.',
        lessons: [
          ['Intro et setup', 'Installation, architecture Angular et lancement du serveur.', 18],
          ['Composants standalone', 'Creer des composants propres et reutilisables.', 24],
        ],
      },
      {
        title: 'Donnees et navigation',
        description: 'Brancher les pages a une API reelle.',
        lessons: [
          ['Routing dynamique', 'Utiliser les routes avec slug et navigation.', 22],
          ['Services HTTP', 'Centraliser les appels API et gerer les erreurs.', 28],
        ],
      },
    ],
    quiz: {
      title: 'Quiz Angular fondations',
      passingScore: 70,
      questions: [
        ['A quoi sert un service Angular ?', ['A partager de la logique et des donnees', 'A remplacer le routeur', 'A compiler le CSS'], 0],
        ['Quel module permet de construire un formulaire reactif ?', ['RouterLink', 'ReactiveFormsModule', 'CommonModule'], 1],
        ['Que represente une route avec :slug ?', ['Une route dynamique', 'Une route interdite', 'Une route CSS'], 0],
      ],
    },
  },
  {
    title: 'JavaScript pour debuter',
    description: 'Maitrise les bases de JavaScript: variables, fonctions, tableaux, objets et DOM.',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
    level: 'Debutant',
    price: 0,
    chapters: [
      {
        title: 'Bases du langage',
        description: 'Les primitives et les fonctions.',
        lessons: [
          ['Variables et types', 'Comprendre let, const, string, number et boolean.', 20],
          ['Fonctions', 'Ecrire des fonctions simples et reutilisables.', 25],
        ],
      },
      {
        title: 'Donnees',
        description: 'Manipuler des collections.',
        lessons: [
          ['Tableaux', 'Parcourir, filtrer et transformer les listes.', 26],
          ['Objets', 'Modeliser des donnees avec des proprietes.', 21],
        ],
      },
    ],
    quiz: {
      title: 'Quiz JavaScript bases',
      passingScore: 60,
      questions: [
        ['Quelle declaration evite la reassignment ?', ['let', 'const', 'var'], 1],
        ['Quelle methode transforme chaque element d un tableau ?', ['map', 'push', 'join'], 0],
        ['Un objet JavaScript contient surtout...', ['des paires cle-valeur', 'des routes', 'des fichiers SQL'], 0],
      ],
    },
  },
  {
    title: 'Node.js pratique',
    description: 'Cree une API Express connectee a MySQL avec authentification JWT.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80',
    level: 'Intermediaire',
    price: 0,
    chapters: [
      {
        title: 'API Express',
        description: 'Routes, middleware et controllers.',
        lessons: [
          ['Serveur Express', 'Configurer express, cors et json.', 19],
          ['Routes REST', 'Organiser les endpoints par domaine.', 25],
        ],
      },
      {
        title: 'Base de donnees',
        description: 'Connecter MySQL a Node.',
        lessons: [
          ['Pool MySQL', 'Utiliser mysql2/promise proprement.', 24],
          ['Requetes securisees', 'Eviter les injections avec les placeholders.', 20],
        ],
      },
    ],
    quiz: {
      title: 'Quiz Node API',
      passingScore: 70,
      questions: [
        ['Pourquoi utiliser des placeholders SQL ?', ['Pour securiser les requetes', 'Pour changer les couleurs', 'Pour lancer Angular'], 0],
        ['Quel middleware lit le JSON ?', ['express.json()', 'cors.json()', 'router.json()'], 0],
        ['JWT sert principalement a...', ['authentifier les requetes', 'creer des tables', 'dessiner les pages'], 0],
      ],
    },
  },
];

const insertCourse = async (course, teacherId) => {
  const [courseResult] = await pool.execute(
    'INSERT INTO courses (title, description, image, level, price, teacher_id) VALUES (?, ?, ?, ?, ?, ?)',
    [course.title, course.description, course.image, course.level, course.price, teacherId]
  );
  const courseId = courseResult.insertId;

  for (const [chapterIndex, chapter] of course.chapters.entries()) {
    const [chapterResult] = await pool.execute(
      'INSERT INTO chapters (title, description, course_id, position) VALUES (?, ?, ?, ?)',
      [chapter.title, chapter.description, courseId, chapterIndex + 1]
    );

    for (const [lessonIndex, lesson] of chapter.lessons.entries()) {
      await pool.execute(
        'INSERT INTO lessons (title, content, video_url, document_url, chapter_id, position, duration_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [lesson[0], lesson[1], null, null, chapterResult.insertId, lessonIndex + 1, lesson[2]]
      );
    }
  }

  const [quizResult] = await pool.execute(
    'INSERT INTO quizzes (title, course_id, passing_score) VALUES (?, ?, ?)',
    [course.quiz.title, courseId, course.quiz.passingScore]
  );

  for (const question of course.quiz.questions) {
    const [questionResult] = await pool.execute(
      'INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)',
      [quizResult.insertId, question[0]]
    );

    for (const [answerIndex, answer] of question[1].entries()) {
      await pool.execute(
        'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
        [questionResult.insertId, answer, answerIndex === question[2] ? 1 : 0]
      );
    }
  }
};

const run = async () => {
  const [[{ count }]] = await pool.execute('SELECT COUNT(*) AS count FROM courses');
  if (count > 0) {
    console.log('Seed skipped: courses table already has data.');
    return;
  }

  const teacherPassword = await bcrypt.hash('teacher123', 10);
  await pool.execute(
    'INSERT IGNORE INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Prof Demo', 'teacher@example.com', teacherPassword, 'teacher']
  );
  const [[teacher]] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', ['teacher@example.com']);

  await pool.execute(
    'INSERT IGNORE INTO categories (name, description) VALUES (?, ?), (?, ?), (?, ?)',
    ['Developpement', 'Cours de programmation web et backend', 'Design', 'Interfaces propres et accessibles', 'Business', 'Competences utiles aux projets']
  );

  for (const course of courses) {
    await insertCourse(course, teacher.id);
  }

  console.log('Seed complete: courses, lessons, quizzes and answers inserted.');
};

run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
