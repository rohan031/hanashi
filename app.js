const express = require("express");
const app = express();

const PORT = process.env.PORT || 4000;
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

const cors = require("cors");
app.use(cors());

require("dotenv").config();

const rooms = {};
const socketToRoom = {};

// socket io
io.on("connection", (socket) => {
	socket.on("user-joined", (payload) => {
		// when the client is connected
		console.log("user-joined");

		const { roomId, name } = payload;
		const userDetails = {
			id: socket.id,
			name,
		};

		if (rooms[roomId]) {
			const userCount = rooms[roomId].length;

			if (userCount === 5) {
				socket.emit("room-full"); // send user full event
				return;
			}

			rooms[roomId].push(userDetails);
		} else {
			rooms[roomId] = [userDetails];
		}

		socket.join(roomId);
		socketToRoom[socket.id] = roomId;

		const users = rooms[roomId].filter((user) => user.id !== socket.id);

		if (users.length > 0) socket.emit("room-info", users); // send peerid and name of other users in the room
	});

	socket.on("new-user-signal", (payload) => {
		// new user initiates the peer to peer connection and shares his signalling data
		console.log("new-user-signal");
		io.to(payload.to).emit("new-user-connected", {
			// give signalling data to the exisiting users in the room
			from: payload.from,
			data: payload.data,
		});
	});

	socket.on("existing-user-signal", (payload) => {
		// existing users send their signal data after accepting the offer
		console.log("existing-user-signal");
		io.to(payload.to).emit("existing-user-res", {
			// send the existing users signal data to the new user
			from: payload.from,
			data: payload.data,
		});
	});

	socket.on("send-message", (payload) => {
		// receiving message from the client
		let userRoom = socketToRoom[socket.id];
		socket.broadcast.to(userRoom).emit("new-message", payload);
	});

	socket.on("disconnect", () => {
		// remove the disconnected user from the room and broadcast other users to remove them as well from client side
		console.log("disconnet");
		let userRoom = socketToRoom[socket.id];

		let room = rooms[userRoom];
		if (room) {
			room = room.filter((user) => user.id !== socket.id);
			rooms[userRoom] = room;
		}

		socket.broadcast.to(userRoom).emit("user-disconnected", socket.id);
	});
});

app.get("/server", (req, res) => {
	res.status(200).json({
		success: "true",
		msg: "Server is working fine",
	});
});

server.listen(PORT, (err) => {
	if (err) console.log("Error starting server ", err);
	else console.log("Server is running on PORT: ", PORT);
});
