// routes/posts.js
const router = require("express").Router();
const Post = require("../models/Post");
const multer = require("multer");
const io = require("../socket"); // Import Socket.io
const { getPosts, createPost } = require("../controllers/posts");

// Set up storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// Initialize Multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },  // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'video/mp4') {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type'), false);
        }
    }
});

// Create a post with file upload (image)
router.post("/", upload.single("img"), async (req, res) => { // Updated to use upload middleware directly
    const newPostData = {
        userId: req.body.userId,
        desc: req.body.desc,
        img: req.file ? req.file.filename : "",
    };

    const newPost = new Post(newPostData);

    try {
        const savedPost = await newPost.save();
        io.emit("receiveNotification", { userId: req.body.userId, message: "Your post has been created!" }); // Emit notification
        res.status(200).json(savedPost);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Like a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            io.emit("receiveNotification", { userId: post.userId, message: "Your post was liked!" }); // Emit notification
            res.status(200).json("Post liked");
        } else {
            res.status(403).json("You already liked this post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// Add a comment to a post
router.put("/:id/comment", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        await post.updateOne({ $push: { comments: { userId: req.body.userId, desc: req.body.desc } } });
        io.emit("receiveNotification", { userId: post.userId, message: "Your post received a comment!" }); // Emit notification
        res.status(200).json("Comment added");
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get a post by ID
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update a post
router.put("/:id", upload.single("img"), async (req, res) => { // Updated to use upload middleware directly
    try {
        const post = await Post.findById(req.params.id);
        if (req.body.userId === post.userId) {
            await post.updateOne({
                $set: {
                    desc: req.body.desc,
                    img: req.file ? req.file.filename : post.img, // Keep the existing image if none is uploaded
                },
            });
            res.status(200).json("Post updated");
        } else {
            res.status(403).json("You can update only your post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete a post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (req.body.userId === post.userId) {
            await post.deleteOne();
            res.status(200).json("Post deleted");
        } else {
            res.status(403).json("You can delete only your post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get all posts
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); // Sort by creation date
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
