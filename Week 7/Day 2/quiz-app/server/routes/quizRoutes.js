const express = require('express');
const quizController = require('../controllers/quizController');

const router = express.Router();

router.get('/questions', quizController.getQuestions);
router.post('/questions/:id/answer', quizController.submitAnswer);

module.exports = router;