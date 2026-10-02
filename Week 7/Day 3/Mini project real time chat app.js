const express = require('express');
const http = require('node:http');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = Number(process.env.PORT || 3001);
const activeUsers = new Map();

app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

function usersInRoom(room) {
	return Array.from(activeUsers.entries())
		.filter(([, user]) => user.room === room)
		.map(([id, user]) => ({ id, username: user.username }));
}

function publishUsers(room) {
	io.to(room).emit('room-users', usersInRoom(room));
}

function publishNotice(room, text) {
	io.to(room).emit('room-notice', { text, timestamp: new Date().toISOString() });
}

function leaveRoom(socket) {
	const user = activeUsers.get(socket.id);
	if (!user) return null;

	activeUsers.delete(socket.id);
	socket.leave(user.room);
	publishNotice(user.room, `${user.username} left #${user.room}`);
	publishUsers(user.room);
	return user;
}

io.on('connection', (socket) => {
	socket.on('join-room', (payload, acknowledge = () => {}) => {
		const username = typeof payload?.username === 'string'
			? payload.username.trim().replace(/\s+/g, ' ')
			: '';
		const roomInput = typeof payload?.room === 'string' ? payload.room.trim() : '';
		const room = roomInput.toLowerCase();

		if (username.length < 2 || username.length > 24) {
			return acknowledge({ error: 'Choose a username between 2 and 24 characters.' });
		}
		if (room.length < 2 || room.length > 32 || !/^[a-z0-9][a-z0-9 _-]*$/.test(room)) {
			return acknowledge({ error: 'Room names must be 2-32 characters and use letters, numbers, spaces, _ or -.' });
		}

		const duplicate = Array.from(activeUsers.entries()).some(([id, user]) =>
			id !== socket.id && user.room === room && user.username.toLowerCase() === username.toLowerCase());
		if (duplicate) {
			return acknowledge({ error: 'That username is already active in this room.' });
		}

		const previous = activeUsers.get(socket.id);
		if (previous?.room === room && previous.username === username) {
			return acknowledge({ ok: true, room, username });
		}
		if (previous) leaveRoom(socket);

		activeUsers.set(socket.id, { username, room });
		socket.join(room);
		publishNotice(room, `${username} joined #${room}`);
		publishUsers(room);
		return acknowledge({ ok: true, room, username });
	});

	socket.on('leave-room', (acknowledge = () => {}) => {
		leaveRoom(socket);
		acknowledge({ ok: true });
	});

	socket.on('send-message', (payload, acknowledge = () => {}) => {
		const user = activeUsers.get(socket.id);
		const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
		if (!user) return acknowledge({ error: 'Join a room before sending messages.' });
		if (!text || text.length > 1000) {
			return acknowledge({ error: 'Messages must be between 1 and 1000 characters.' });
		}

		const message = {
			id: randomUUID(),
			username: user.username,
			room: user.room,
			text,
			timestamp: new Date().toISOString(),
		};
		io.to(user.room).emit('chat-message', message);
		return acknowledge({ ok: true, id: message.id });
	});

	socket.on('disconnect', () => leaveRoom(socket));
});

if (require.main === module) {
	server.listen(PORT, () => {
		console.log(`Real-time chat is running at http://localhost:${PORT}`);
	});
}

module.exports = { app, server, io, activeUsers };
