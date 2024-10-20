const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    desc: { type: String, required: true },
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    desc: { type: String, max: 500 },
    img: { type: String },
    likes: { type: Array, default: [] },
    dislikes: { type: Array, default: [] },
    comments: { type: [CommentSchema], default: [] },  // Add this line
}, { timestamps: true });

module.exports = mongoose.model("Post", PostSchema);
