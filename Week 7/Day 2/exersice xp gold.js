const express = require('express');
const pool = require('./server/config/db');
const { initializeTasksTable } = require('./server/models/taskModel');
const todoRoutes = require('./server/routes/todos');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use('/api/todos', todoRoutes);

app.use((req, res) => {
	res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
	if (res.headersSent) {
		return next(err);
	}

	const status = err.status || 500;
	const message = status < 500 ? err.message : 'Internal server error';
	if (status >= 500) {
		console.error(err);
	}

	return res.status(status).json({ message });
});

async function startServer() {
	try {
		await initializeTasksTable();
		app.listen(PORT, () => {
			console.log(`Todo API running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error('Unable to connect to PostgreSQL or initialize tasks table:', error);
		await pool.end();
		process.exitCode = 1;
	}
}

if (require.main === module) {
	startServer();
}

module.exports = app;
