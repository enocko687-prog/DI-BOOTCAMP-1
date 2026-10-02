const pool = require('../config/db');

const seedQuestions = [
  {
    question: 'Which JavaScript keyword declares a block-scoped variable that can be reassigned?',
    options: ['const', 'let', 'static', 'final'],
    correctAnswer: 'let'
  },
  {
    question: 'What does the HTTP status code 404 mean?',
    options: ['The request succeeded', 'The resource was not found', 'The user is unauthorized', 'The server is unavailable'],
    correctAnswer: 'The resource was not found'
  },
  {
    question: 'Which CSS layout system is designed for arranging items in one direction at a time?',
    options: ['Float', 'Flexbox', 'Table layout', 'Position absolute'],
    correctAnswer: 'Flexbox'
  },
  {
    question: 'Which SQL command reads rows from a table?',
    options: ['SELECT', 'UPDATE', 'INSERT', 'DELETE'],
    correctAnswer: 'SELECT'
  },
  {
    question: 'What does Express middleware express.json() do?',
    options: ['Connects to PostgreSQL', 'Parses incoming JSON request bodies', 'Renders HTML templates', 'Starts the HTTP server'],
    correctAnswer: 'Parses incoming JSON request bodies'
  }
];

async function initializeQuizDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS options (
      id SERIAL PRIMARY KEY,
      option TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL UNIQUE,
      correct_option_id INTEGER NOT NULL REFERENCES options(id)
    );

    CREATE TABLE IF NOT EXISTS questions_options (
      question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      option_id INTEGER NOT NULL REFERENCES options(id) ON DELETE CASCADE,
      PRIMARY KEY (question_id, option_id)
    );
  `);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const seed of seedQuestions) {
      const optionIds = new Map();
      for (const option of seed.options) {
        const optionResult = await client.query(
          'INSERT INTO options (option) VALUES ($1) ON CONFLICT (option) DO UPDATE SET option = EXCLUDED.option RETURNING id',
          [option]
        );
        optionIds.set(option, optionResult.rows[0].id);
      }

      const correctOptionId = optionIds.get(seed.correctAnswer);
      const questionResult = await client.query(
        'INSERT INTO questions (question, correct_option_id) VALUES ($1, $2) ON CONFLICT (question) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id RETURNING id',
        [seed.question, correctOptionId]
      );
      const questionId = questionResult.rows[0].id;

      for (const optionId of optionIds.values()) {
        await client.query(
          'INSERT INTO questions_options (question_id, option_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [questionId, optionId]
        );
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getQuestions() {
  const result = await pool.query(`
    SELECT
      q.id,
      q.question,
      COALESCE(
        json_agg(json_build_object('id', o.id, 'text', o.option) ORDER BY o.id)
          FILTER (WHERE o.id IS NOT NULL),
        '[]'
      ) AS options
    FROM questions q
    LEFT JOIN questions_options qo ON qo.question_id = q.id
    LEFT JOIN options o ON o.id = qo.option_id
    GROUP BY q.id
    ORDER BY q.id
  `);
  return result.rows;
}

async function checkAnswer(questionId, optionId) {
  const result = await pool.query(`
    SELECT q.correct_option_id, qo.option_id AS selected_option_id
    FROM questions q
    LEFT JOIN questions_options qo
      ON qo.question_id = q.id AND qo.option_id = $2
    WHERE q.id = $1
  `, [questionId, optionId]);
  return result.rows[0];
}

module.exports = {
  initializeQuizDatabase,
  getQuestions,
  checkAnswer
};