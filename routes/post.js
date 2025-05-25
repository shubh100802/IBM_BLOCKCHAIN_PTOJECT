const express = require("express");
const Post = require("../models/Post");

const router = express.Router();

// Get user's own posts
router.get("/api/myposts", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const posts = await Post.find({ createdBy: req.session.user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching user's posts");
  }
});


// POST /api/edit-post/:id - update a post
// Fetch a single post by ID
router.get("/api/post/:id", async (req, res) => {
  console.log("Getting post with ID:", req.params.id);  // ✅ DEBUG LOG

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.log("Post not found"); // ✅ DEBUG LOG
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ error: "Server error" });
  }
});





module.exports = router;
