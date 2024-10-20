const router = require("express").Router();
const User = require("../models/User");

// Follow a user
router.put("/:id/follow", async (req, res) => {
    if (req.body.userId === req.params.id) {
        return res.status(400).json("You can't follow yourself.");
    }

    try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (!user.followers.includes(req.body.userId)) {
            await user.updateOne({ $push: { followers: req.body.userId } });
            await currentUser.updateOne({ $push: { following: req.params.id } });
            res.status(200).json("User followed");
        } else {
            res.status(400).json("You already follow this user");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// Unfollow a user
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId === req.params.id) {
        return res.status(400).json("You can't unfollow yourself.");
    }

    try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (user.followers.includes(req.body.userId)) {
            await user.updateOne({ $pull: { followers: req.body.userId } });
            await currentUser.updateOne({ $pull: { following: req.params.id } });
            res.status(200).json("User unfollowed");
        } else {
            res.status(400).json("You don't follow this user");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
