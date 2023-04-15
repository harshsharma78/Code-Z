const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const ACTIONS = require('./src/Action');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));

/* Handles the refresh page error */
app.use((req, res, next) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const userSocketMap = {};

const getAllConnectedClients = roomId => {
	/* Get all the user rooms in the socket server.	
	io.sockets.adapter.rooms.get(roomId)returns map, Array.from is used to convert the map to array */
	return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
		socketId => {
			return {
				socketId,
				username: userSocketMap[socketId],
			};
		},
	);
};
io.on('connection', socket => {
	console.log('socket', socket.id);

	// Listening to the JOIN EVENT -> Whenever someone is joined this is triggered
	socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
		userSocketMap[socket.id] = username;
		socket.join(roomId);

		const clients = getAllConnectedClients(roomId);

		clients.forEach(({ socketId }) => {
			// Emitting joined message to the existing users
			io.to(socketId).emit(ACTIONS.JOINED, {
				clients,
				username,
				socketId: socket.id,
			});
		});
	});

	/* Listening for the CODE_CHANGE EVENT and syncing it with other users */
	socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
		/* io.to means sending the response to everyone including us 
		socket.in means sending to everyone excluding the one typing */
		socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
			code,
		});
	});

	/* Listening for the SYNC_CODE EVENT and syncing it with joined users */
	socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
		io.to(socketId).emit(ACTIONS.CODE_CHANGE, {
			code,
		});
	});

	/* LISTENING for the DISCONNECTED EVENT */
	socket.on('disconnecting', () => {
		const rooms = [...socket.rooms];
		rooms.forEach(roomId => {
			/* Notify others */
			socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
				socketId: socket.id,
				username: userSocketMap[socket.id],
			});
		});
		delete userSocketMap[socket.id];
		socket.leave();
	});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
