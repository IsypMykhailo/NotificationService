const express = require('express');
const router = express.Router();

const controller = require("../controllers/notifications")

router.get('/:institutionId', controller.getNotifications)

module.exports = router;
