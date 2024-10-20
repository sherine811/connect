// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const socketIo = require("./socket"); // Import the Socket.io instance

// Import Routes
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const userRoute = require("./routes/users");
const profileRoute = require("./routes/profile"); // Ensure profile route is imported

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cors());
app.use(express.static("public")); // Serve static files from the public directory

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/users", userRoute);
app.use("/api/profile", profileRoute); // Include profile route here

// Socket.io setup
const server = http.createServer(app);
const io = socketIo; // Use the io instance from socket.js

// Socket.io connection
io.attach(server); // Attach the Socket.io instance to the HTTP server
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Handle real-time messages
    socket.on("sendMessage", (messageData) => {
        io.emit("receiveMessage", messageData); // Broadcast message to all clients
    });

    // Handle notifications
    socket.on("sendNotification", (notificationData) => {
        io.emit("receiveNotification", notificationData); // Broadcast notification to all clients
    });

    // Handle disconnects
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Start the server
server.listen(8800, () => {
    console.log("Backend server is running on port 8800!");
});
