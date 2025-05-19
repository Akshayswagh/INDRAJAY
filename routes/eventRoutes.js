const express = require("express");
const router = express.Router();
const getMulterUploader = require("../config/multerConfig");
const uploader = getMulterUploader("events");

const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.post("/", uploader.single("image"), createEvent);
router.put("/:id", uploader.single("image"), updateEvent);
router.delete("/:id", deleteEvent);

module.exports = router;
