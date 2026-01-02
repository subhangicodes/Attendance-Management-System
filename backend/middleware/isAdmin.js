// middleware/isAdmin.js

module.exports = (req, res, next) => {
  try {
    // req.user must be set by your auth middleware (JWT)
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Authorization error" });
  }
};
