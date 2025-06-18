const express = require('express');
const router = express.Router();
const logisticController = require('../controllers/logisticController');

// All routes here are prefixed with /admin/api/logistics
router.post('/', logisticController.createLogistic);
router.put('/:id', logisticController.updateLogistic);
router.delete('/:id', logisticController.deleteLogistic);

module.exports = router;