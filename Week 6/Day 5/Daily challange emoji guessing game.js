const express = require('express');
const app = express();
const PORT = 5008;

const emojiList = [
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

app.use(express.json());

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getRound() {
  const correct = emojiList[Math.floor(Math.random() * emojiList.length)];
  const distractors = emojiList.filter((item) => item.name !== correct.name);
  const options = shuffleArray([...distractors.slice(0, 3), correct]);

  return {
    correct,
    options: options.map((item) => item.name)
  };
}

app.get('/api/emojis', (req, res) => {
  res.json({ emojis: emojiList });
});

app.get('/api/leaderboard', (req, res) => {
  res.json({ leaderboard: leaderboard.slice(0, 5) });
});

app.post('/api/leaderboard', (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Name and score are required.' });
  }

  leaderboard.push({ name, score });
  leaderboard.sort((a, b) => b.score - a.score);

  return res.json({ leaderboard: leaderboard.slice(0, 5) });
});

app.get('/', (req, res) => {
  res.send(
    '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
    '  <meta charset="UTF-8" />' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
    '  <title>Emoji Guessing Game</title>' +
    '  <style>' +
    '    body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #fef3c7, #dbeafe); margin: 0; padding: 30px; text-align: center; }' +
    '    .card { max-width: 700px; margin: 0 auto; background: white; border-radius: 20px; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); }' +
    '    #emoji-display { font-size: 120px; margin: 20px 0; }' +
    '    .options { display: grid; grid-template-columns: repeat(2, minmax(150px, 1fr)); gap: 12px; margin-top: 20px; }' +
    '    button { padding: 12px 18px; border: none; border-radius: 12px; font-size: 16px; cursor: pointer; background: #2563eb; color: white; }' +
    '    button:hover { opacity: 0.9; }' +
    '    #feedback { margin-top: 18px; font-weight: bold; min-height: 24px; }' +
    '    #scoreboard { margin-top: 20px; text-align: left; }' +
    '    #leaderboard { list-style: none; padding: 0; }' +
    '    #leaderboard li { padding: 6px 0; border-bottom: 1px solid #e5e7eb; }' +
    '  </style>' +
    '</head>' +
    '<body>' +
    '  <div class="card">' +
    '    <h1>Emoji Guessing Game</h1>' +
    '    <p>Score: <strong id="score">0</strong></p>' +
    '    <div id="emoji-display">🎯</div>' +
    '    <form id="guess-form">' +
    '      <div id="options" class="options"></div>' +
    '      <div style="margin-top: 20px;">' +
    '        <button type="submit">Submit Guess</button>' +
    '        <button type="button" id="next-button" style="display: none; background: #16a34a;">Next Round</button>' +
    '      </div>' +
    '    </form>' +
    '    <div id="feedback"></div>' +
    '    <div id="scoreboard">' +
    '      <h3>Leaderboard</h3>' +
    '      <ul id="leaderboard"></ul>' +
    '    </div>' +
    '  </div>' +
    '  <script>' +
    '    let currentRound = null;' +
    '    let score = 0;' +
    '    const scoreEl = document.getElementById("score");' +
    '    const emojiDisplay = document.getElementById("emoji-display");' +
    '    const optionsContainer = document.getElementById("options");' +
    '    const feedback = document.getElementById("feedback");' +
    '    const guessForm = document.getElementById("guess-form");' +
    '    const nextButton = document.getElementById("next-button");' +
    '    const leaderboardList = document.getElementById("leaderboard");' +
    '    function shuffleArray(items) {' +
    '      const copy = [...items];' +
    '      for (let i = copy.length - 1; i > 0; i--) {' +
    '        const j = Math.floor(Math.random() * (i + 1));' +
    '        [copy[i], copy[j]] = [copy[j], copy[i]];' +
    '      }' +
    '      return copy;' +
    '    }' +
    '    async function loadLeaderboard() {' +
    '      const response = await fetch("/api/leaderboard");' +
    '      const data = await response.json();' +
    '      leaderboardList.innerHTML = "";' +
    '      data.leaderboard.forEach((entry, index) => {' +
    '        const item = document.createElement("li");' +
    '        item.textContent = (index + 1) + ". " + entry.name + " - " + entry.score;' +
    '        leaderboardList.appendChild(item);' +
    '      });' +
    '    }' +
    '    function createRound() {' +
    '      const emojiData = [{ emoji: "😀", name: "Smile" }, { emoji: "🐶", name: "Dog" }, { emoji: "🌮", name: "Taco" }, { emoji: "🍕", name: "Pizza" }, { emoji: "🌙", name: "Moon" }, { emoji: "🚀", name: "Rocket" }, { emoji: "🎉", name: "Party" }, { emoji: "🍎", name: "Apple" }, { emoji: "🌞", name: "Sun" }, { emoji: "🐱", name: "Cat" }];' +
    '      const correct = emojiData[Math.floor(Math.random() * emojiData.length)];' +
    '      const distractors = emojiData.filter((item) => item.name !== correct.name);' +
    '      const options = shuffleArray([...distractors.slice(0, 3), correct]);' +
    '      currentRound = { correct: correct, options: options.map((item) => item.name) };' +
    '      emojiDisplay.textContent = correct.emoji;' +
    '      optionsContainer.innerHTML = "";' +
    '      feedback.textContent = "";' +
    '      nextButton.style.display = "none";' +
    '      currentRound.options.forEach((option) => {' +
    '        const button = document.createElement("button");' +
    '        button.type = "button";' +
    '        button.textContent = option;' +
    '        button.addEventListener("click", () => {' +
    '          document.querySelectorAll("#options button").forEach((btn) => btn.disabled = true);' +
    '          button.style.background = "#1d4ed8";' +
    '          button.dataset.choice = option;' +
    '        });' +
    '        optionsContainer.appendChild(button);' +
    '      });' +
    '    }' +
    '    guessForm.addEventListener("submit", (event) => {' +
    '      event.preventDefault();' +
    '      const selected = document.querySelector("#options button[style*=\"background\"]");' +
    '      if (!selected) {' +
    '        feedback.textContent = "Please choose an answer first.";' +
    '        feedback.style.color = "red";' +
    '        return;' +
    '      }' +
    '      const userChoice = selected.textContent;' +
    '      const correctName = currentRound.correct.name;' +
    '      if (userChoice === correctName) {' +
    '        score += 1;' +
    '        feedback.textContent = "Correct! " + currentRound.correct.emoji + " is " + correctName + ".";' +
    '        feedback.style.color = "green";' +
    '      } else {' +
    '        feedback.textContent = "Wrong! The correct answer is " + correctName + ".";' +
    '        feedback.style.color = "red";' +
    '      }' +
    '      scoreEl.textContent = score;' +
    '      nextButton.style.display = "inline-block";' +
    '    });' +
    '    nextButton.addEventListener("click", () => {' +
    '      createRound();' +
    '    });' +
    '    createRound();' +
    '    loadLeaderboard();' +
    '  </script>' +
    '</body>' +
    '</html>'
  );
});

app.listen(PORT, () => {
  console.log('Emoji guessing game running on http://localhost:' + PORT);
});
