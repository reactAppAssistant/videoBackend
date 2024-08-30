const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files (e.g., for a web-based client)
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New user connected');

    // Handle joining a room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room ${roomId}`);
        // Notify other users in the room that a new user has joined
        socket.to(roomId).emit('user-joined');
    });

    // Handle offer
    socket.on('offer', ({ sdp, roomId }) => {
        console.log('Forwarding offer to room:', roomId);
        socket.to(roomId).emit('offer', sdp);
    });

    // Handle answer
    socket.on('answer', ({ sdp, roomId }) => {
        console.log('Forwarding answer to room:', roomId);
        socket.to(roomId).emit('answer', sdp);
    });

    // Handle ICE candidate
    socket.on('ice-candidate', ({ candidate, roomId }) => {
        console.log('Forwarding ICE candidate to room:', roomId);
        socket.to(roomId).emit('ice-candidate', candidate);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
