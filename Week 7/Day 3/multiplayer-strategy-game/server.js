const express = require('express');
const path = require('node:path');
const { randomBytes, randomUUID, scryptSync, timingSafeEqual } = require('node:crypto');

const app = express();
const server = require('node:http').createServer(app);
const users = new Map();
const sessions = new Map();
const games = new Map();
const SIZE = 10;
const OBSTACLES = [
	{ x: 2, y: 1 }, { x: 3, y: 1 }, { x: 6, y: 8 },
	{ x: 7, y: 8 }, { x: 4, y: 3 }, { x: 5, y: 6 },
];
const DIRECTIONS = {
	up: { x: 0, y: -1 },
	down: { x: 0, y: 1 },
	left: { x: -1, y: 0 },
	right: { x: 1, y: 0 },
};

app.use(express.json({ limit: '16kb' }));
app.use(express.static(path.join(__dirname, 'public')));

class ApiError extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
	}
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
	return { salt, hash: scryptSync(password, salt, 64).toString('hex') };
}

function authenticate(req, res, next) {
	const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
	const userId = token && sessions.get(token);
	const user = userId && users.get(userId);
	if (!user) return next(new ApiError(401, 'Sign in to continue.'));
	req.user = user;
	return next();
}

function publicGame(game) {
	return {
		id: game.id,
		status: game.status,
		players: game.players.map((player) => ({
			userId: player.userId,
			username: users.get(player.userId)?.username || 'Unknown',
			position: { ...player.position },
			base: { ...player.base },
			color: player.color,
		})),
		obstacles: game.obstacles.map((cell) => ({ ...cell })),
		turnUserId: game.turnUserId,
		winnerUserId: game.winnerUserId,
		winnerName: game.winnerUserId ? users.get(game.winnerUserId)?.username : null,
		moves: game.moves,
		lastMove: game.lastMove,
		createdAt: game.createdAt,
		updatedAt: game.updatedAt,
	};
}

function requireGame(id) {
	const game = games.get(id);
	if (!game) throw new ApiError(404, 'Game not found.');
	return game;
}

function requirePlayer(game, userId) {
	const player = game.players.find((item) => item.userId === userId);
	if (!player) throw new ApiError(403, 'You are not a player in this game.');
	return player;
}

function requireActiveTurn(game, userId) {
	if (game.status !== 'active') throw new ApiError(409, 'The game is waiting for another player.');
	if (game.winnerUserId) throw new ApiError(409, 'This game has already ended.');
	if (game.turnUserId !== userId) throw new ApiError(409, 'It is the other player\'s turn.');
}

function isSameCell(first, second) {
	return first.x === second.x && first.y === second.y;
}

function isAdjacent(first, second) {
	return Math.abs(first.x - second.x) + Math.abs(first.y - second.y) === 1;
}

function nextTurn(game, currentPlayer) {
	game.turnUserId = game.players.find((player) => player.userId !== currentPlayer.userId).userId;
	game.moves += 1;
	game.updatedAt = new Date().toISOString();
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/register', (req, res, next) => {
	try {
		const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
		const password = typeof req.body?.password === 'string' ? req.body.password : '';
		if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
			throw new ApiError(400, 'Username must be 3-20 characters using letters, numbers, _ or -.');
		}
		if (password.length < 8 || password.length > 128) {
			throw new ApiError(400, 'Password must be between 8 and 128 characters.');
		}
		if (Array.from(users.values()).some((user) => user.username.toLowerCase() === username.toLowerCase())) {
			throw new ApiError(409, 'That username is already taken.');
		}

		const credentials = hashPassword(password);
		const user = { id: randomUUID(), username, ...credentials };
		users.set(user.id, user);
		const token = randomBytes(32).toString('hex');
		sessions.set(token, user.id);
		return res.status(201).json({ token, user: { id: user.id, username: user.username } });
	} catch (error) {
		return next(error);
	}
});

app.post('/api/auth/login', (req, res, next) => {
	try {
		const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
		const password = typeof req.body?.password === 'string' ? req.body.password : '';
		const user = Array.from(users.values()).find((item) => item.username.toLowerCase() === username.toLowerCase());
		if (!user || !password) throw new ApiError(401, 'Username or password is incorrect.');

		const actual = Buffer.from(hashPassword(password, user.salt).hash, 'hex');
		const expected = Buffer.from(user.hash, 'hex');
		if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
			throw new ApiError(401, 'Username or password is incorrect.');
		}

		const token = randomBytes(32).toString('hex');
		sessions.set(token, user.id);
		return res.json({ token, user: { id: user.id, username: user.username } });
	} catch (error) {
		return next(error);
	}
});

app.get('/api/games', authenticate, (req, res) => {
	const available = Array.from(games.values())
		.filter((game) => game.status === 'waiting' && !game.players.some((player) => player.userId === req.user.id))
		.map((game) => ({
			id: game.id,
			createdBy: users.get(game.players[0].userId)?.username || 'Unknown',
			createdAt: game.createdAt,
		}));
	return res.json({ games: available });
});

app.post('/api/games', authenticate, (req, res) => {
	const now = new Date().toISOString();
	const game = {
		id: randomUUID(),
		status: 'waiting',
		players: [{ userId: req.user.id, position: { x: 0, y: 0 }, base: { x: 0, y: 0 }, color: 'coral' }],
		obstacles: OBSTACLES.map((cell) => ({ ...cell })),
		turnUserId: null,
		winnerUserId: null,
		moves: 0,
		lastMove: null,
		createdAt: now,
		updatedAt: now,
	};
	games.set(game.id, game);
	return res.status(201).json({ game: publicGame(game) });
});

app.post('/api/games/:id/join', authenticate, (req, res, next) => {
	try {
		const game = requireGame(req.params.id);
		if (game.status !== 'waiting') throw new ApiError(409, 'This game is no longer waiting for a player.');
		if (game.players.some((player) => player.userId === req.user.id)) {
			throw new ApiError(409, 'You created this game; another player must join it.');
		}

		game.players.push({
			userId: req.user.id,
			position: { x: SIZE - 1, y: SIZE - 1 },
			base: { x: SIZE - 1, y: SIZE - 1 },
			color: 'turquoise',
		});
		game.status = 'active';
		game.turnUserId = game.players[0].userId;
		game.updatedAt = new Date().toISOString();
		return res.json({ game: publicGame(game) });
	} catch (error) {
		return next(error);
	}
});

app.get('/api/games/:id', authenticate, (req, res, next) => {
	try {
		const game = requireGame(req.params.id);
		requirePlayer(game, req.user.id);
		return res.json({ game: publicGame(game) });
	} catch (error) {
		return next(error);
	}
});

app.post('/api/games/:id/move', authenticate, (req, res, next) => {
	try {
		const game = requireGame(req.params.id);
		const player = requirePlayer(game, req.user.id);
		requireActiveTurn(game, req.user.id);

		const direction = DIRECTIONS[req.body?.direction];
		if (!direction) throw new ApiError(400, 'Choose up, down, left, or right.');
		const destination = { x: player.position.x + direction.x, y: player.position.y + direction.y };
		if (destination.x < 0 || destination.x >= SIZE || destination.y < 0 || destination.y >= SIZE) {
			throw new ApiError(400, 'That move would leave the board.');
		}
		if (game.obstacles.some((cell) => isSameCell(cell, destination))) {
			throw new ApiError(400, 'An obstacle blocks that square.');
		}

		const opponent = game.players.find((item) => item.userId !== player.userId);
		if (isSameCell(destination, opponent.base)) {
			player.position = destination;
			game.winnerUserId = player.userId;
			game.status = 'finished';
			game.turnUserId = null;
			game.moves += 1;
			game.updatedAt = new Date().toISOString();
			game.lastMove = { username: req.user.username, action: 'captured the base', at: game.updatedAt };
			return res.json({ game: publicGame(game) });
		}
		if (isSameCell(destination, opponent.position)) throw new ApiError(400, 'The other player occupies that square.');

		player.position = destination;
		game.lastMove = { username: req.user.username, action: `moved ${req.body.direction}`, at: new Date().toISOString() };
		nextTurn(game, player);
		return res.json({ game: publicGame(game) });
	} catch (error) {
		return next(error);
	}
});

app.post('/api/games/:id/attack', authenticate, (req, res, next) => {
	try {
		const game = requireGame(req.params.id);
		const player = requirePlayer(game, req.user.id);
		requireActiveTurn(game, req.user.id);
		const opponent = game.players.find((item) => item.userId !== player.userId);
		if (!isAdjacent(player.position, opponent.base)) {
			throw new ApiError(400, 'Move next to the opposing base before attacking it.');
		}

		game.winnerUserId = player.userId;
		game.status = 'finished';
		game.turnUserId = null;
		game.moves += 1;
		game.updatedAt = new Date().toISOString();
		game.lastMove = { username: req.user.username, action: 'captured the base', at: game.updatedAt };
		return res.json({ game: publicGame(game) });
	} catch (error) {
		return next(error);
	}
});

app.use((error, req, res, next) => {
	if (res.headersSent) return next(error);
	const status = error.status || (error instanceof SyntaxError ? 400 : 500);
	if (status >= 500) console.error(error);
	return res.status(status).json({ error: status >= 500 ? 'Server error.' : error.message });
});

if (require.main === module) {
	const PORT = Number(process.env.PORT || 3002);
	server.listen(PORT, () => {
		console.log(`Gridbound is running at http://localhost:${PORT}`);
	});
}

module.exports = { app, server, users, sessions, games };