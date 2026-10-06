const jwt = require("jsonwebtoken");

// Middleware to protect admin routes — reads adminToken from HttpOnly cookie or Authorization header
const protectAdmin = (req, res, next) => {
  try {
    let token = req.cookies?.adminToken;

    // Support Bearer token in Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Admin not authorized" });
    }

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admins only" });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Admin token failed", error: error.message });
  }
};

module.exports = { protectAdmin };
