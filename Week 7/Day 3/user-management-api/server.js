const express = require('express');
const path = require('node:path');
const { createUserRouter } = require('./routes/userRoutes');

const PUBLIC_DIR = path.join(__dirname, 'public');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

function createApp(usersFile = USERS_FILE) {
	const app = express();
	app.use(express.json({ limit: '32kb' }));
	app.get('/', (req, res) => res.redirect('/login.html'));
	app.use(express.static(PUBLIC_DIR));
	app.use('/', createUserRouter(usersFile));
	app.use((error, req, res, next) => {
		if (res.headersSent) return next(error);
		const status = error.status || (error instanceof SyntaxError ? 400 : 500);
		if (status >= 500) console.error(error);
		const message = status >= 500 ? 'Unable to process the request. Check the user data file and try again.' : error.message;
		return res.status(status).json({ message });
	});
	return app;
}

const app = createApp();
const server = require('node:http').createServer(app);

if (require.main === module) {
	const PORT = Number(process.env.PORT || 3003);
	server.listen(PORT, () => {
		console.log(`User management API running at http://localhost:${PORT}`);
	});
}

module.exports = { app, server, createApp, USERS_FILE };