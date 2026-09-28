const express = require('express');
const app = express();
const router = express.Router();

const PORT = process.env.PORT || 3001;

const triviaQuestions = [
  {
    question: 'What is the capital of France?',
    answer: 'Paris',
  },
  {
    question: 'Which planet is known as the Red Planet?',
    answer: 'Mars',
  },
  {
    question: 'What is the largest mammal in the world?',
    answer: 'Blue whale',
  },
];

let score = 0;
let currentQuestionIndex = 0;
let message = '';

function resetQuiz() {
  score = 0;
  currentQuestionIndex = 0;
  message = '';
}

function getCurrentQuestion() {
  return triviaQuestions[currentQuestionIndex];
}

app.use(express.urlencoded({ extended: true }));

router.get('/', (req, res) => {
  resetQuiz();
  res.send(`
    <h1>Trivia Quiz Game</h1>
    <p>Welcome! Ready to test your knowledge?</p>
    <a href="/quiz?reset=true">Start Quiz</a>
  `);
});

router.get('/quiz', (req, res) => {
  if (req.query.reset === 'true') {
    resetQuiz();
  }

  if (currentQuestionIndex >= triviaQuestions.length) {
    resetQuiz();
  }

  const question = getCurrentQuestion();
  const feedback = message ? `<p><strong>${message}</strong></p>` : '';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Trivia Quiz</title>
    </head>
    <body>
      <h1>Trivia Quiz</h1>
      <p>Question ${currentQuestionIndex + 1} of ${triviaQuestions.length}</p>
      <p>Score: ${score}</p>
      ${feedback}
      <p>${question.question}</p>
      <form action="/quiz" method="POST">
        <label for="answer">Your answer:</label>
        <input type="text" id="answer" name="answer" required />
        <button type="submit">Submit Answer</button>
      </form>
    </body>
    </html>
  `;

  res.send(html);
});

router.post('/quiz', (req, res) => {
  const answer = (req.body.answer || '').trim();
  const question = getCurrentQuestion();

  if (!question) {
    return res.redirect('/quiz/score');
  }

  const isCorrect = answer.toLowerCase() === question.answer.toLowerCase();

  if (isCorrect) {
    score += 1;
    message = 'Correct! Great job!';
  } else {
    message = `Incorrect. The correct answer is: ${question.answer}.`;
  }

  currentQuestionIndex += 1;

  if (currentQuestionIndex >= triviaQuestions.length) {
    return res.redirect('/quiz/score');
  }

  return res.redirect('/quiz');
});

router.get('/quiz/score', (req, res) => {
  const finalScore = score;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Quiz Score</title>
    </head>
    <body>
      <h1>Quiz Finished!</h1>
      <p>Your final score is: <strong>${finalScore}/${triviaQuestions.length}</strong></p>
      <p>${finalScore === triviaQuestions.length ? 'Perfect score! Amazing!' : 'Nice try! Keep practicing.'}</p>
      <a href="/quiz?reset=true">Play Again</a>
    </body>
    </html>
  `;

  res.send(html);
});

app.use('/', router);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Trivia quiz app running on http://localhost:${PORT}`);
  });
}

module.exports = app;
