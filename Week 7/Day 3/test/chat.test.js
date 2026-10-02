const assert = require('node:assert/strict');
const { once } = require('node:events');
const { after, before, test } = require('node:test');
const { io: createClient } = require('socket.io-client');
const { server, io } = require('../Mini project real time chat app.js');

function waitForEvent(socket, eventName, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${eventName}`)), timeout);
    socket.once(eventName, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

function emitWithAck(socket, eventName, payload) {
  return new Promise((resolve) => socket.emit(eventName, payload, resolve));
}

before(async () => {
  server.listen(0);
  await once(server, 'listening');
});

after(async () => {
  await new Promise((resolve) => io.close(resolve));
});

test('users join rooms, exchange live messages, and leave', async (context) => {
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}`;
  const alice = createClient(url, { transports: ['websocket'] });
  const bob = createClient(url, { transports: ['websocket'] });
  context.after(() => {
    alice.disconnect();
    bob.disconnect();
  });

  const aliceConnected = waitForEvent(alice, 'connect');
  const bobConnected = waitForEvent(bob, 'connect');
  await Promise.all([aliceConnected, bobConnected]);

  const firstRoster = waitForEvent(alice, 'room-users');
  assert.deepEqual(await emitWithAck(alice, 'join-room', { username: 'Alice', room: 'general' }), {
    ok: true,
    room: 'general',
    username: 'Alice',
  });
  assert.deepEqual((await firstRoster).map((user) => user.username), ['Alice']);

  const aliceRoster = waitForEvent(alice, 'room-users');
  const bobRoster = waitForEvent(bob, 'room-users');
  assert.equal((await emitWithAck(bob, 'join-room', { username: 'Bob', room: 'general' })).ok, true);
  assert.deepEqual((await aliceRoster).map((user) => user.username), ['Alice', 'Bob']);
  assert.deepEqual((await bobRoster).map((user) => user.username), ['Alice', 'Bob']);

  const receivedMessage = waitForEvent(bob, 'chat-message');
  assert.equal((await emitWithAck(alice, 'send-message', { text: 'Hello, room!' })).ok, true);
  const message = await receivedMessage;
  assert.equal(message.username, 'Alice');
  assert.equal(message.text, 'Hello, room!');
  assert.equal(message.room, 'general');

  const rosterAfterLeave = waitForEvent(alice, 'room-users');
  assert.deepEqual(await emitWithAck(bob, 'leave-room'), { ok: true });
  assert.deepEqual((await rosterAfterLeave).map((user) => user.username), ['Alice']);

  assert.deepEqual(await emitWithAck(bob, 'join-room', { username: 'Alice', room: 'general' }), {
    error: 'That username is already active in this room.',
  });
  assert.deepEqual(await emitWithAck(bob, 'send-message', { text: 'Not in a room' }), {
    error: 'Join a room before sending messages.',
  });
});