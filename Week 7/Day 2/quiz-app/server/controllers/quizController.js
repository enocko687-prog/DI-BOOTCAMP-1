const quizModel = require('../models/quizModel');

function parsePositiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function getQuestions(req, res) {
  const questions = await quizModel.getQuestions();
  return res.status(200).json({ questions });
}

async function submitAnswer(req, res) {
  const questionId = parsePositiveInteger(req.params.id);
  const optionId = parsePositiveInteger(req.body && req.body.optionId);

  if (!questionId || !optionId) {
    return res.status(400).json({ message: 'A valid question id and optionId are required' });
  }

  const answer = await quizModel.checkAnswer(questionId, optionId);
  if (!answer) {
    return res.status(404).json({ message: 'Question not found' });
  }
  if (!answer.selected_option_id) {
    return res.status(400).json({ message: 'That option does not belong to this question' });
  }

  return res.status(200).json({ correct: answer.correct_option_id === answer.selected_option_id });
}

module.exports = { getQuestions, submitAnswer };