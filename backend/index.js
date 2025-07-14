const express = require("express");
require("dotenv").config();

const { connectToMongoDB } = require("./connection");
const scanRouter = require("./routes/scan");
const userRouter = require("./routes/user");

const { authMiddleware } = require("./middlewares/auth");

const app = express();

// Middlewares
app.use(express.json());

// Router Registrations
app.use("/api/scans", authMiddleware, scanRouter);
app.use("/api/users", userRouter);

// DB connection
connectToMongoDB(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error", err));

// Protected route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.status(200).json({ message: "authorised", user: req.user });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
