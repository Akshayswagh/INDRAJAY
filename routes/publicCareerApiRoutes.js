// routes/publicCareerApiRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllJobs, // This now refers to getAllJobsAPI due to the export in controller
  getJobById, // This now refers to getJobByIdAPI
} = require("../controllers/careerController");

router.get("/", getAllJobs);
router.get("/:id", getJobById);

module.exports = router;