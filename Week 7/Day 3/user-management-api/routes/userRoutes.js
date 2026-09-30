const bcrypt = require('bcrypt');
const express = require('express');
const { randomUUID } = require('node:crypto');
const { readUsers, updateUsers } = require('../services/userStore');

const router = express.Router();
const PASSWORD_ROUNDS = 10;
const DUPLICATE_MESSAGE = 'This user already exists! Please Log in.';

class ApiError extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
	}
}

function asyncHandler(handler) {
	return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function safeUser(user) {
	const { passwordHash, ...publicUser } = user;
	return publicUser;
}

function requireObject(body) {
	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		throw new ApiError(400, 'Request body must be a JSON object.');
	}
}

function normalizeRegistration(body) {
	requireObject(body);
	const fields = ['name', 'lastName', 'email', 'username'];
	const values = Object.fromEntries(fields.map((field) => [field, typeof body[field] === 'string' ? body[field].trim() : '']));
	const password = typeof body.password === 'string' ? body.password : '';
	if (Object.values(values).some((value) => !value) || !password) {
		throw new ApiError(400, 'Name, last name, email, username, and password are required.');
	}
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
		throw new ApiError(400, 'Enter a valid email address.');
	}
	if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(values.username)) {
		throw new ApiError(400, 'Username must be 3-24 characters using letters, numbers, dots, underscores, or hyphens.');
	}
	if (password.length < 8 || password.length > 72) {
		throw new ApiError(400, 'Password must be between 8 and 72 characters.');
	}
	return { ...values, password };
}

async function passwordAlreadyUsed(users, password, exceptId) {
	for (const user of users) {
		if (user.id !== exceptId && await bcrypt.compare(password, user.passwordHash)) return true;
	}
	return false;
}

function findUserById(users, id) {
	const user = users.find((item) => item.id === id);
	if (!user) throw new ApiError(404, 'User not found.');
	return user;
}

router.post('/register', asyncHandler(async (req, res) => {
	const input = normalizeRegistration(req.body);
	const user = await updateUsers(req.usersFile, async (users) => {
		const exists = users.some((item) =>
			item.username.toLowerCase() === input.username.toLowerCase() ||
			item.email.toLowerCase() === input.email.toLowerCase());
		if (exists || await passwordAlreadyUsed(users, input.password)) {
			throw new ApiError(409, DUPLICATE_MESSAGE);
		}

		const now = new Date().toISOString();
		const newUser = {
			id: randomUUID(),
			name: input.name,
			lastName: input.lastName,
			email: input.email,
			username: input.username,
			passwordHash: await bcrypt.hash(input.password, PASSWORD_ROUNDS),
			createdAt: now,
			updatedAt: now,
		};
		users.push(newUser);
		return newUser;
	});
	return res.status(201).json({ message: 'User registered successfully.', user: safeUser(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
	requireObject(req.body);
	const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
	const password = typeof req.body.password === 'string' ? req.body.password : '';
	if (!username || !password) throw new ApiError(400, 'Username and password are required.');

	const users = await readUsers(req.usersFile);
	const user = users.find((item) => item.username.toLowerCase() === username.toLowerCase());
	if (!user || !await bcrypt.compare(password, user.passwordHash)) {
		throw new ApiError(401, 'Invalid username or password.');
	}
	return res.json({ message: `Welcome, ${user.name}! You are logged in.`, user: safeUser(user) });
}));

router.get('/users', asyncHandler(async (req, res) => {
	const users = await readUsers(req.usersFile);
	return res.json({ users: users.map(safeUser) });
}));

router.get('/users/:id', asyncHandler(async (req, res) => {
	const users = await readUsers(req.usersFile);
	return res.json({ user: safeUser(findUserById(users, req.params.id)) });
}));

router.put('/users/:id', asyncHandler(async (req, res) => {
	requireObject(req.body);
	const allowedFields = ['name', 'lastName', 'email', 'username', 'password'];
	const fields = Object.keys(req.body);
	if (!fields.length || fields.some((field) => !allowedFields.includes(field))) {
		throw new ApiError(400, 'Provide one or more valid user fields to update.');
	}

	const updates = {};
	for (const field of fields) {
		if (typeof req.body[field] !== 'string' || !req.body[field].trim()) {
			throw new ApiError(400, `${field} must be a non-empty string.`);
		}
		updates[field] = req.body[field].trim();
	}
	if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
		throw new ApiError(400, 'Enter a valid email address.');
	}
	if (updates.username && !/^[a-zA-Z0-9_.-]{3,24}$/.test(updates.username)) {
		throw new ApiError(400, 'Username must be 3-24 characters using letters, numbers, dots, underscores, or hyphens.');
	}
	if (updates.password && (updates.password.length < 8 || updates.password.length > 72)) {
		throw new ApiError(400, 'Password must be between 8 and 72 characters.');
	}

	const user = await updateUsers(req.usersFile, async (users) => {
		const current = findUserById(users, req.params.id);
		const duplicate = users.some((item) => item.id !== current.id && (
			(updates.username && item.username.toLowerCase() === updates.username.toLowerCase()) ||
			(updates.email && item.email.toLowerCase() === updates.email.toLowerCase())
		));
		if (duplicate || (updates.password && await passwordAlreadyUsed(users, updates.password, current.id))) {
			throw new ApiError(409, DUPLICATE_MESSAGE);
		}

		for (const field of ['name', 'lastName', 'email', 'username']) {
			if (updates[field]) current[field] = updates[field];
		}
		if (updates.password) current.passwordHash = await bcrypt.hash(updates.password, PASSWORD_ROUNDS);
		current.updatedAt = new Date().toISOString();
		return current;
	});
	return res.json({ message: 'User updated successfully.', user: safeUser(user) });
}));

function createUserRouter(usersFile) {
	const configuredRouter = express.Router();
	configuredRouter.use((req, res, next) => {
		req.usersFile = usersFile;
		next();
	});
	configuredRouter.use(router);
	return configuredRouter;
}

module.exports = { createUserRouter };