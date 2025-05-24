const express = require("express");
const router = express.Router();
// You might have a dedicated admin controller or use parts of indServiceController
const { showAddForm, showEditForm, getAdminServicesListPage } = require("../controllers/adminIndServiceController"); // Example

// Route to display the list of services in the admin panel
router.get('/', getAdminServicesListPage); // e.g., /admin/industrial-services

// Route to display the "add new service" form
router.get("/add", showAddForm);           // e.g., /admin/industrial-services/add

// Route to display the "edit service" form
router.get("/edit/:id", showEditForm);     // e.g., /admin/industrial-services/edit/123

module.exports = router;



