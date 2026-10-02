const express = require('express');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use('/tasks', taskRoutes);

app.use((req, res) => {
	res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
	if (res.headersSent) {
		return next(error);
	}

	if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
		return res.status(400).json({ message: 'Request body must contain valid JSON' });
	}

	console.error(error);
	const status = error.status || 500;
	if (status >= 500) {
		console.error(error);
	}
	const message = status < 500 ? error.message : 'Unable to complete the request';
	return res.status(status).json({ message });
});

if (require.main === module) {
	app.listen(PORT, () => {
		console.log(`Task API running at http://localhost:${PORT}`);
	});
}

module.exports = app;
