const express = require("express");

const { handleSignUp, handleLogin } = require("../controllers/user");

const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.post("/register", authMiddleware, handleSignUp);
router.post("/login", handleLogin);

module.exports = router;
