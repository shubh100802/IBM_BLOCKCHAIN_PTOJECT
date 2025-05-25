// server.js
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const User = require("./models/User");
const Post = require("./models/Post");





const app = express();
const PORT = 3000;



// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "helpmeout_secret_key",
    resave: false,
    saveUninitialized: true
}));

const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

const postRoutes = require("./routes/post");
app.use('/api', postRoutes);







// 🔐 Protect create.html
app.get("/create.html", (req, res, next) => {
    if (req.session.user) {
      res.set('Cache-Control', 'no-store'); // 🧠 prevents browser from caching the page
      return next(); // Let static middleware serve it
    } else {
      return res.redirect("/login.html");
    }
  });
  

// ✅ Serve static files
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/helpmeout", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.get("/api/user", (req, res) => {
    if (req.session.user) {
      res.json({ name: req.session.user.name });
    } else {
      res.status(401).json({ error: "Not logged in" });
    }
  });
  

app.post("/create-post", async (req, res) => {
    const { title, description, category, type, contact } = req.body;

    if (!req.session.user) {
        return res.status(401).send("Unauthorized");
    }

    try {
        const newPost = new Post({
            title,
            description,
            category,
            type,
            contact,
            createdBy: req.session.user._id
        });

        await newPost.save();
        res.redirect("/myposts.html");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving post.");
    }
});

app.get("/api/posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 0; // 0 = no limit
      const posts = await Post.find().sort({ createdAt: -1 }).limit(limit);
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching posts");
    }
  });

  app.get("/api/myposts", async (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  
    try {
      const myPosts = await Post.find({ createdBy: req.session.user._id }).sort({ createdAt: -1 });
      res.json(myPosts);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching user's posts");
    }
  });
  
  



// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
