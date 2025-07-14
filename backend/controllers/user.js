const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const User = require("../models/user");

async function handleSignUp(req, res) {
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing." });
  }
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Validate email
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  try {
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists." });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.status(200).json({ message: "User created successfully." });
  } catch (error) {
    console.log("Error creating user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function handleLogin(req, res) {
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing." });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  try {
    const dbUser = await User.findOne({ email });
    if (!dbUser) {
      return res.status(400).json({ message: "Invalid user credentials." });
    }

    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (!isPasswordMatched) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    const payload = {
      _id: dbUser._id,
      username: dbUser.username,
      email: dbUser.email,
    };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login successful",
      user: payload,
      jwtToken,
    });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { handleSignUp, handleLogin };
