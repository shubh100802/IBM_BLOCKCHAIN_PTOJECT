const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send("Passwords do not match.");
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send("User already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.redirect("/login.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error during registration.");
  }
});


router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) return res.send("Invalid email or password.");
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.send("Invalid email or password.");
  
      req.session.user = user;
      res.redirect("/create.html");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error during login.");
    }
  });

  router.get("/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/login.html");
    });
  });
  
  


module.exports = router;
