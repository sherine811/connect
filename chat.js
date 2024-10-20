const router = require("express").Router();
const Chat = require("../models/Chat");

// Create a new chat
router.post("/", async (req, res) => {
    const newChat = new Chat({
        members: [req.body.senderId, req.body.receiverId],
    });

    try {
        const savedChat = await newChat.save();
        res.status(200).json(savedChat);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get chats of a user
router.get("/:userId", async (req, res) => {
    try {
        const chats = await Chat.find({ members: { $in: [req.params.userId] } });
        res.status(200).json(chats);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
