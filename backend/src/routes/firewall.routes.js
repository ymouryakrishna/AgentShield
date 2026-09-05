const express = require('express');
const router = express.Router();
const firewallController = require('../controllers/firewall.controller');
const { validateBody } = require('../middleware/validation.middleware');
const { commerceRequestSchema } = require('../schemas/commerceRequest.schema');

router.post('/firewall/evaluate', validateBody(commerceRequestSchema), firewallController.evaluateRequest);

module.exports = router;
