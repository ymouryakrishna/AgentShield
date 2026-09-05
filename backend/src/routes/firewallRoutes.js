const express = require('express');
const router = express.Router();
const firewallController = require('../controllers/firewallController');

router.post('/firewall/evaluate', firewallController.evaluate);

module.exports = router;
