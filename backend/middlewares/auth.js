const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const dbUser = await User.findById(decoded._id);

    if (!dbUser) {
      return res.status(401).json({ message: "Not Authenticated" });
    }

    req.user = decoded; // Now you can access user details using req object
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not Authenticated" });
  }
}

module.exports = { authMiddleware };
