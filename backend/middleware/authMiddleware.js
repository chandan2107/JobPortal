const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes — reads token from HttpOnly cookie or Authorization header
const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Support Bearer token in Authorization header (essential for cross-site Vercel <-> Render)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const secret = process.env.JT_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed", error: error.message });
  }
};

module.exports = { protect };