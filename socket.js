const { Server } = require("socket.io");

// Create a new Socket.io server
const io = new Server({
    cors: {
        origin: "*",  // Allow any origin for development; adjust in production
        methods: ["GET", "POST"],
    },
});

// Export the io instance
module.exports = io;
