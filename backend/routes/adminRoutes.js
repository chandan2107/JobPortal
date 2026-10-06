const express = require("express");
const {
  adminLogin,
  adminLogout,
  getAdminMe,
  getAllEmployers,
  getPendingEmployers,
  approveEmployer,
  rejectEmployer,
} = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

// Public admin routes
router.post("/login", adminLogin);
router.post("/logout", adminLogout);

// Protected admin routes
router.get("/me", protectAdmin, getAdminMe);
router.get("/employers", protectAdmin, getAllEmployers);
router.get("/employers/pending", protectAdmin, getPendingEmployers);
router.put("/employers/:id/approve", protectAdmin, approveEmployer);
router.put("/employers/:id/reject", protectAdmin, rejectEmployer);

module.exports = router;
