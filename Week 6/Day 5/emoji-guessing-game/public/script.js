let emojis = [];
let currentRound = null;
let score = 0;

const scoreEl = document.getElementById('score');
const emojiDisplay = document.getElementById('emoji-display');
const optionsContainer = document.getElementById('options');
const feedback = document.getElementById('feedback');
const form = document.getElementById('guess-form');
const nextBtn = document.getElementById('next-btn');
const leaderboardEl = document.getElementById('leaderboard');

async function fetchEmojis() {
  const response = await fetch('/api/emojis');
  const data = await response.json();
  emojis = data.emojis;
  loadLeaderboard();
  generateRound();
}

async function loadLeaderboard() {
  const response = await fetch('/api/leaderboard');
  const data = await response.json();
  leaderboardEl.innerHTML = '';

  data.leaderboard.forEach((entry, index) => {
    const item = document.createElement('li');
    item.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
    leaderboardEl.appendChild(item);
  });
}

function generateRound() {
  const correct = emojis[Math.floor(Math.random() * emojis.length)];
  const distractors = emojis.filter((item) => item.name !== correct.name);
  const options = shuffle([...distractors.slice(0, 3), correct]).map((item) => item.name);

  currentRound = { correct, options };
  emojiDisplay.textContent = correct.emoji;
  optionsContainer.innerHTML = '';
  feedback.textContent = '';

  options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-btn';
    button.textContent = option;
    button.addEventListener('click', () => {
      document.querySelectorAll('.option-btn').forEach((btn) => btn.disabled = true);
      button.style.border = '2px solid #2563eb';
      form.dataset.selected = option;
    });
    optionsContainer.appendChild(button);
  });

  nextBtn.classList.add('hidden');
  form.querySelector('button[type="submit"]').disabled = false;
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const selected = form.dataset.selected;

  if (!selected) {
    feedback.textContent = 'Please choose an answer first.';
    return;
  }

  const isCorrect = selected === currentRound.correct.name;

  if (isCorrect) {
    score += 1;
    feedback.textContent = `Correct! ${currentRound.correct.emoji} is ${currentRound.correct.name}.`;
    feedback.style.color = 'green';
  } else {
    feedback.textContent = `Wrong! The correct answer is ${currentRound.correct.name}.`;
    feedback.style.color = 'red';
  }

  scoreEl.textContent = score;
  form.querySelector('button[type="submit"]').disabled = true;
  nextBtn.classList.remove('hidden');
});

nextBtn.addEventListener('click', () => {
  form.dataset.selected = '';
  generateRound();
});

fetchEmojis();
