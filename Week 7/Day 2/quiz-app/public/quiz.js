const quizContent = document.querySelector('#quiz-content');
const feedback = document.querySelector('#feedback');
const progressLabel = document.querySelector('#progress-label');
const progressTrack = document.querySelector('.progress-track');
const progressFill = document.querySelector('#progress-fill');
const scoreValue = document.querySelector('#score-value');
const scoreCaption = document.querySelector('#score-caption');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedOptionId = null;
let answered = false;

function updateScore() {
  const answeredCount = Math.min(
    currentQuestionIndex + (answered ? 1 : 0),
    questions.length
  );
  scoreValue.innerHTML = `${score}<span> / ${questions.length}</span>`;

  if (score === answeredCount && answeredCount > 0) {
    scoreCaption.textContent = 'Perfect so far. Keep it going.';
  } else if (score > 0) {
    scoreCaption.textContent = 'Nice work. Build on that streak.';
  } else {
    scoreCaption.textContent = 'Every question is a fresh start.';
  }
}

function setProgress() {
  const questionNumber = currentQuestionIndex + 1;
  const percentage = (currentQuestionIndex / questions.length) * 100;
  progressLabel.textContent = `QUESTION ${String(questionNumber).padStart(2, '0')} OF ${String(questions.length).padStart(2, '0')}`;
  progressTrack.setAttribute('aria-valuenow', String(Math.round(percentage)));
  progressFill.style.width = `${percentage}%`;
}

function renderQuestion() {
  const question = questions[currentQuestionIndex];
  selectedOptionId = null;
  answered = false;
  feedback.textContent = '';
  feedback.className = 'feedback';
  setProgress();
  updateScore();

  const questionNumber = document.createElement('p');
  questionNumber.className = 'question-number';
  questionNumber.textContent = `Q${String(currentQuestionIndex + 1).padStart(2, '0')}`;

  const title = document.createElement('h1');
  title.id = 'question-text';
  title.textContent = question.question;

  const form = document.createElement('form');
  form.id = 'answer-form';

  const options = document.createElement('fieldset');
  options.className = 'answer-list';
  options.setAttribute('aria-label', 'Choose one answer');

  question.options.forEach((option, index) => {
    const label = document.createElement('label');
    label.className = 'option-row';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = String(option.id);
    input.addEventListener('change', () => {
      selectedOptionId = option.id;
      form.querySelector('#submit-answer').disabled = false;
    });

    const copy = document.createElement('span');
    copy.className = 'option-copy';

    const marker = document.createElement('span');
    marker.className = 'option-marker';
    marker.textContent = String.fromCharCode(65 + index);

    const text = document.createElement('span');
    text.textContent = option.text;
    copy.append(marker, text);
    label.append(input, copy);
    options.append(label);
  });

  const actions = document.createElement('div');
  actions.className = 'quiz-actions';

  const submitButton = document.createElement('button');
  submitButton.className = 'primary-button';
  submitButton.id = 'submit-answer';
  submitButton.type = 'submit';
  submitButton.disabled = true;
  submitButton.textContent = 'Check answer';

  const nextButton = document.createElement('button');
  nextButton.className = 'primary-button';
  nextButton.id = 'next-question';
  nextButton.type = 'button';
  nextButton.hidden = true;
  nextButton.textContent = currentQuestionIndex === questions.length - 1 ? 'See final score' : 'Next question';
  nextButton.addEventListener('click', () => {
    currentQuestionIndex += 1;
    if (currentQuestionIndex >= questions.length) {
      renderFinalScore();
    } else {
      renderQuestion();
    }
  });

  actions.append(submitButton, nextButton);
  form.append(options, actions);
  form.addEventListener('submit', submitAnswer);
  quizContent.replaceChildren(questionNumber, title, form);
}

async function submitAnswer(event) {
  event.preventDefault();
  if (selectedOptionId === null || answered) {
    return;
  }

  const question = questions[currentQuestionIndex];
  const submitButton = document.querySelector('#submit-answer');
  submitButton.disabled = true;

  try {
    const response = await fetch(`/api/questions/${question.id}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId: selectedOptionId })
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Your answer could not be checked.');
    }

    answered = true;
    if (result.correct) {
      score += 1;
      feedback.textContent = 'Correct. You got it.';
      feedback.classList.add('is-correct');
      document.querySelector(`input[value="${selectedOptionId}"]`).closest('.option-row').classList.add('is-correct');
    } else {
      feedback.textContent = 'Not quite. Keep going to the next one.';
      feedback.classList.add('is-incorrect');
      document.querySelector(`input[value="${selectedOptionId}"]`).closest('.option-row').classList.add('is-incorrect');
    }

    document.querySelectorAll('input[name="answer"]').forEach((input) => {
      input.disabled = true;
    });
    document.querySelector('#next-question').hidden = false;
    updateScore();
  } catch (error) {
    feedback.textContent = error.message;
    feedback.classList.add('is-error');
    submitButton.disabled = false;
  }
}

function renderFinalScore() {
  progressLabel.textContent = 'QUIZ COMPLETE';
  progressTrack.setAttribute('aria-valuenow', '100');
  progressFill.style.width = '100%';
  scoreValue.innerHTML = `${score}<span> / ${questions.length}</span>`;
  scoreCaption.textContent = 'Final score';
  feedback.textContent = '';

  const summary = document.createElement('section');
  summary.className = 'final-score';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'THAT’S A WRAP';

  const title = document.createElement('h1');
  title.textContent = score === questions.length ? 'Flawless run.' : score >= questions.length / 2 ? 'Strong work.' : 'Good first round.';

  const result = document.createElement('span');
  result.className = 'final-number';
  result.textContent = `${score} / ${questions.length}`;

  const message = document.createElement('p');
  message.textContent = `You answered ${score} of ${questions.length} questions correctly.`;

  const restart = document.createElement('button');
  restart.className = 'primary-button';
  restart.type = 'button';
  restart.textContent = 'Play again';
  restart.addEventListener('click', startQuiz);

  summary.append(eyebrow, title, result, message, restart);
  quizContent.replaceChildren(summary);
}

function showLoadError(message) {
  progressLabel.textContent = 'QUIZ UNAVAILABLE';
  feedback.textContent = message;
  feedback.className = 'feedback is-error';

  const retry = document.createElement('button');
  retry.className = 'secondary-button';
  retry.type = 'button';
  retry.textContent = 'Try again';
  retry.addEventListener('click', startQuiz);
  quizContent.replaceChildren(retry);
}

async function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  answered = false;
  questions = [];
  updateScore();
  quizContent.innerHTML = '<p class="loading-message">Getting your questions ready...</p>';
  feedback.textContent = '';

  try {
    const response = await fetch('/api/questions');
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'The quiz could not be loaded.');
    }
    if (!Array.isArray(result.questions) || result.questions.length === 0) {
      throw new Error('No questions are available right now.');
    }

    questions = result.questions;
    renderQuestion();
  } catch (error) {
    showLoadError(error.message);
  }
}

startQuiz();