const express = require('express');
const path = require('path');
const pool = require('./quiz-app/server/config/db');
const { initializeQuizDatabase } = require('./quiz-app/server/models/quizModel');
const quizRoutes = require('./quiz-app/server/routes/quizRoutes');

const app = express();
const PORT = Number(process.env.PORT || 3002);
const publicDirectory = path.join(__dirname, 'quiz-app', 'public');
let databaseReady = false;

app.use(express.json());
app.use(express.static(publicDirectory));

app.use('/api', (req, res, next) => {
	if (!databaseReady) {
		return res.status(503).json({ message: 'Quiz database is unavailable. Check the PostgreSQL connection and restart the server.' });
	}

	return next();
}, quizRoutes);

app.use((req, res) => {
	res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
	if (res.headersSent) {
		return next(err);
	}

	console.error(err);
	return res.status(err.status || 500).json({ message: 'Unable to process the request' });
});

async function startServer() {
	try {
		await initializeQuizDatabase();
		databaseReady = true;
		console.log('Quiz database connected and questions are ready.');
	} catch (error) {
		console.error('Quiz database is unavailable:', error.message);
		await pool.end();
	}

	app.listen(PORT, () => {
		console.log(`Quiz app running on http://localhost:${PORT}`);
	});
}

if (require.main === module) {
	startServer();
}

module.exports = app;
