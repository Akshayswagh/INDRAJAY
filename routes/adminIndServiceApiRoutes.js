const express = require("express");
const router = express.Router();
const { createService, updateService, deleteService } = require("../controllers/adminIndServiceController"); // Or a dedicated admin controller

router.post("/", createService);        // POST /admin/api/indservices
router.put("/:id", updateService);      // PUT  /admin/api/indservices/123
router.delete("/:id", deleteService);   // DELETE /admin/api/indservices/123

module.exports = router;