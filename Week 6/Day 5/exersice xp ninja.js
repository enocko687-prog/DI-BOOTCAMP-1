const express = require('express');
const path = require('path');

const app = express();
const PORT = 5003;

const questions = [
  {
    question: 'What does HTML stand for?',
    options: ['Hyper Trainer Markup Language', 'Hyper Text Markup Language', 'High Text Management Language', 'Hyperlink and Text Markup Language'],
    answer: 'Hyper Text Markup Language'
  },
  {
    question: 'Which JavaScript keyword declares a block-scoped variable?',
    options: ['var', 'let', 'const', 'function'],
    answer: 'let'
  },
  {
    question: 'Which language is primarily used for styling a web page?',
    options: ['JavaScript', 'CSS', 'Python', 'SQL'],
    answer: 'CSS'
  },
  {
    question: 'What is the output of 2 + 2 in JavaScript?',
    options: ['3', '4', '22', 'NaN'],
    answer: '4'
  },
  {
    question: 'Which method is used to add an element to the end of an array?',
    options: ['push()', 'pop()', 'shift()', 'slice()'],
    answer: 'push()'
  }
];

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/questions', (req, res) => {
  res.json(questions);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Quiz game running on http://localhost:${PORT}`);
});
