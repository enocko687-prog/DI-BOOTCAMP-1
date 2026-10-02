const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');
const { createApp } = require('../server');

let tempDirectory;
let usersFile;
let server;
let baseUrl;

async function request(route, options = {}) {
	const response = await fetch(`${baseUrl}${route}`, {
		...options,
		headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
	});
	return { status: response.status, body: await response.json() };
}

before(async () => {
	tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'user-api-'));
	usersFile = path.join(tempDirectory, 'users.json');
	await fs.writeFile(usersFile, '[]\n', 'utf8');
	server = createApp(usersFile).listen(0);
	await new Promise((resolve) => server.once('listening', resolve));
	baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
	await new Promise((resolve) => server.close(resolve));
	await fs.rm(tempDirectory, { recursive: true, force: true });
});

test('register, reject duplicates, login, list/get users, and update a user', async () => {
	const input = {
		name: 'Ada',
		lastName: 'Lovelace',
		email: 'ada@example.com',
		username: 'ada.codes',
		password: 'analytical-engine-1',
	};
	const registered = await request('/register', { method: 'POST', body: JSON.stringify(input) });
	assert.equal(registered.status, 201);
	assert.equal(registered.body.user.username, input.username);
	assert.equal('passwordHash' in registered.body.user, false);
	const userId = registered.body.user.id;

	const savedUsers = JSON.parse(await fs.readFile(usersFile, 'utf8'));
	assert.notEqual(savedUsers[0].passwordHash, input.password);
	assert.match(savedUsers[0].passwordHash, /^\$2[aby]\$/);

	const duplicateUsername = await request('/register', {
		method: 'POST',
		body: JSON.stringify({ ...input, email: 'another@example.com' }),
	});
	assert.equal(duplicateUsername.status, 409);
	assert.equal(duplicateUsername.body.message, 'This user already exists! Please Log in.');

	const duplicatePassword = await request('/register', {
		method: 'POST',
		body: JSON.stringify({ ...input, username: 'ada.other', email: 'other@example.com' }),
	});
	assert.equal(duplicatePassword.status, 409);
	assert.equal(JSON.parse(await fs.readFile(usersFile, 'utf8')).length, 1);

	const login = await request('/login', { method: 'POST', body: JSON.stringify({ username: input.username, password: input.password }) });
	assert.equal(login.status, 200);
	assert.match(login.body.message, /Welcome, Ada/);

	const wrongLogin = await request('/login', { method: 'POST', body: JSON.stringify({ username: input.username, password: 'wrong-password' }) });
	assert.equal(wrongLogin.status, 401);

	const userList = await request('/users');
	assert.equal(userList.status, 200);
	assert.equal(userList.body.users.length, 1);
	assert.equal('passwordHash' in userList.body.users[0], false);

	const userDetails = await request(`/users/${userId}`);
	assert.equal(userDetails.body.user.email, input.email);

	const updated = await request(`/users/${userId}`, {
		method: 'PUT',
		body: JSON.stringify({ name: 'Augusta', email: 'augusta@example.com' }),
	});
	assert.equal(updated.status, 200);
	assert.equal(updated.body.user.name, 'Augusta');
	assert.equal(updated.body.user.email, 'augusta@example.com');

	const missing = await request('/users/not-a-user');
	assert.equal(missing.status, 404);
});