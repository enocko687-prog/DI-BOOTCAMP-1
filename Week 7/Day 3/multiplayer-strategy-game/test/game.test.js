const assert = require('node:assert/strict');
const { once } = require('node:events');
const { after, before, test } = require('node:test');
const { app, server } = require('../server');

let baseUrl;

async function request(path, { token, ...options } = {}) {
	const response = await fetch(`${baseUrl}${path}`, {
		...options,
		headers: {
			...(options.body ? { 'Content-Type': 'application/json' } : {}),
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...options.headers,
		},
	});
	return { status: response.status, body: await response.json() };
}

async function createUser(username) {
	const result = await request('/api/auth/register', {
		method: 'POST',
		body: JSON.stringify({ username, password: 'test-password-123' }),
	});
	assert.equal(result.status, 201);
	return result.body;
}

before(async () => {
	server.listen(0);
	await once(server, 'listening');
	baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
	await new Promise((resolve) => server.close(resolve));
});

test('register, start, join, take turns, and enforce obstacles and base attacks', async () => {
	const alice = await createUser(`alpha_${Date.now()}`);
	const bob = await createUser(`bravo_${Date.now()}`);

	const unauthenticated = await request('/api/games');
	assert.equal(unauthenticated.status, 401);

	const started = await request('/api/games', { token: alice.token, method: 'POST' });
	assert.equal(started.status, 201);
	const gameId = started.body.game.id;
	assert.equal(started.body.game.status, 'waiting');

	const occupiedMove = await request(`/api/games/${gameId}/move`, {
		token: alice.token,
		method: 'POST',
		body: JSON.stringify({ direction: 'right' }),
	});
	assert.equal(occupiedMove.status, 409);

	const joined = await request(`/api/games/${gameId}/join`, { token: bob.token, method: 'POST' });
	assert.equal(joined.body.game.status, 'active');
	assert.equal(joined.body.game.turnUserId, alice.user.id);

	const { games } = require('../server');
	games.get(gameId).players[0].position = { x: 1, y: 1 };
	const blocked = await request(`/api/games/${gameId}/move`, {
		token: alice.token,
		method: 'POST',
		body: JSON.stringify({ direction: 'right' }),
	});
	assert.equal(blocked.status, 400);
	assert.match(blocked.body.error, /obstacle/i);

	games.get(gameId).players[0].position = { x: 0, y: 0 };
	const moved = await request(`/api/games/${gameId}/move`, {
		token: alice.token,
		method: 'POST',
		body: JSON.stringify({ direction: 'right' }),
	});
	assert.equal(moved.status, 200);
	assert.deepEqual(moved.body.game.players[0].position, { x: 1, y: 0 });
	assert.equal(moved.body.game.turnUserId, bob.user.id);

	const wrongTurn = await request(`/api/games/${gameId}/move`, {
		token: alice.token,
		method: 'POST',
		body: JSON.stringify({ direction: 'right' }),
	});
	assert.equal(wrongTurn.status, 409);

	const notAdjacent = await request(`/api/games/${gameId}/attack`, { token: bob.token, method: 'POST' });
	assert.equal(notAdjacent.status, 400);

	const details = await request(`/api/games/${gameId}`, { token: bob.token });
	assert.equal(details.status, 200);
	assert.equal(details.body.game.moves, 1);
});

test('capture by attack wins and prevents further moves', async () => {
	const username = `capture_${String(Date.now()).slice(-6)}`;
	const alice = await createUser(username);
	const bob = await createUser(`rival_${String(Date.now()).slice(-6)}`);
	const created = await request('/api/games', { token: alice.token, method: 'POST' });
	const gameId = created.body.game.id;
	await request(`/api/games/${gameId}/join`, { token: bob.token, method: 'POST' });

	const { games } = require('../server');
	const game = games.get(gameId);
	game.players[0].position = { x: 8, y: 9 };
	game.turnUserId = alice.user.id;

	const won = await request(`/api/games/${gameId}/attack`, { token: alice.token, method: 'POST' });
	assert.equal(won.status, 200);
	assert.equal(won.body.game.status, 'finished');
	assert.equal(won.body.game.winnerUserId, alice.user.id);

	const afterWin = await request(`/api/games/${gameId}/move`, {
		token: bob.token,
		method: 'POST',
		body: JSON.stringify({ direction: 'left' }),
	});
	assert.equal(afterWin.status, 409);
});