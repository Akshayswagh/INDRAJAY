const express = require('express');
const router = express.Router();
const logisticController = require('../controllers/logisticController');

// All routes here are prefixed with /admin/logistics
router.get('/', logisticController.getLogisticsPage);
router.get('/add', logisticController.getAddLogisticPage);

module.exports = router;