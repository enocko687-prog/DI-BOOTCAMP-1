let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options');
const feedback = document.getElementById('feedback');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const quizBox = document.getElementById('quiz-box');
const resultBox = document.getElementById('result-box');
const finalScore = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

async function loadQuestions() {
  const response = await fetch('/api/questions');
  questions = await response.json();
  startQuiz();
}

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswer = null;
  feedback.textContent = '';
  quizBox.hidden = false;
  resultBox.hidden = true;
  renderQuestion();
}

function renderQuestion() {
  selectedAnswer = null;
  feedback.textContent = '';
  nextBtn.hidden = true;
  submitBtn.disabled = false;

  const currentQuestion = questions[currentQuestionIndex];
  questionText.textContent = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;
  optionsContainer.innerHTML = '';

  currentQuestion.options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-btn';
    button.textContent = option;

    button.addEventListener('click', () => {
      selectedAnswer = option;
      document.querySelectorAll('.option-btn').forEach((btn) => {
        btn.classList.remove('selected');
      });
      button.classList.add('selected');
    });

    optionsContainer.appendChild(button);
  });
}

function checkAnswer() {
  if (!selectedAnswer) {
    feedback.textContent = 'Please select an answer before submitting.';
    return;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.answer;

  if (isCorrect) {
    score += 1;
    feedback.textContent = 'Correct!';
    feedback.style.color = 'green';
  } else {
    feedback.textContent = `Wrong! The correct answer is: ${currentQuestion.answer}`;
    feedback.style.color = 'red';
  }

  submitBtn.disabled = true;
  nextBtn.hidden = false;
  document.querySelectorAll('.option-btn').forEach((button) => {
    button.disabled = true;
  });
}

function showFinalScore() {
  quizBox.hidden = true;
  resultBox.hidden = false;
  finalScore.textContent = `Your score: ${score} / ${questions.length}`;
}

function nextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex += 1;
    renderQuestion();
  } else {
    showFinalScore();
  }
}

submitBtn.addEventListener('click', checkAnswer);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', startQuiz);

loadQuestions();
