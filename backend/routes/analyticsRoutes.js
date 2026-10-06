const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getEmployerAnalytics } = require("../controllers/analyticsController");

router.get("/overview", protect, getEmployerAnalytics);

module.exports = router;