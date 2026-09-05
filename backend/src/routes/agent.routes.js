const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agent.controller');

router.get('/agents', agentController.getAgents);
router.post('/agents', agentController.registerAgent);

module.exports = router;
