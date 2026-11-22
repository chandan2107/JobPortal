const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  syncResumes,
  exportResumePdf,
} = require("../controllers/resumeController");

// Public PDF export (supports both logged-in and guest drafting users)
router.post("/export-pdf", exportResumePdf);

// All other resume routes are protected
router.use(protect);

router.route("/")
  .get(getResumes)
  .post(createResume);

router.post("/sync", syncResumes);

router.route("/:id")
  .get(getResumeById)
  .put(updateResume)
  .delete(deleteResume);

module.exports = router;
