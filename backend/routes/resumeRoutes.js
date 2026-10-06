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
} = require("../controllers/resumeController");

// All resume routes are protected
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
