const express = require('express');
const path = require('path');

const app = express();
const PORT = 5004;

const emojis = [
  { emoji: '😀', name: 'Smile' },
  { emoji: '🐶', name: 'Dog' },
  { emoji: '🌮', name: 'Taco' },
  { emoji: '🍕', name: 'Pizza' },
  { emoji: '🌙', name: 'Moon' },
  { emoji: '🚀', name: 'Rocket' },
  { emoji: '🎉', name: 'Party' },
  { emoji: '🍎', name: 'Apple' },
  { emoji: '🌞', name: 'Sun' },
  { emoji: '🐱', name: 'Cat' }
];

const leaderboard = [
  { name: 'Alice', score: 8 },
  { name: 'Bob', score: 6 },
  { name: 'Charlie', score: 5 }
];

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/api/emojis', (req, res) => {
  res.json({ emojis });
});

app.get('/api/leaderboard', (req, res) => {
  res.json({ leaderboard: leaderboard.sort((a, b) => b.score - a.score).slice(0, 5) });
});

app.post('/api/leaderboard', (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof score !== 'number') {
    return res.status(400).json({ message: 'Name and score are required' });
  }

  leaderboard.push({ name, score });
  leaderboard.sort((a, b) => b.score - a.score);

  return res.status(201).json({
    message: 'Score saved',
    leaderboard: leaderboard.slice(0, 5)
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Emoji guessing game running on http://localhost:${PORT}`);
});
