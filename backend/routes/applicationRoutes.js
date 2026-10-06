const express = require("express");
const {
  applyToJob,
  getMyApplications,
  getAllEmployerApplicants,
  getApplicantsForJob,
  getApplicationById,
  updateStatus,
} = require("../controllers/applicationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:jobId", protect, applyToJob);
router.get("/my", protect, getMyApplications);
router.get("/my-all", protect, getAllEmployerApplicants);
router.get("/job/:jobId", protect, getApplicantsForJob);
router.get("/:id", protect, getApplicationById);
router.put("/:id/status", protect, updateStatus);

module.exports = router;