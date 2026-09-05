const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demo.controller');

router.post('/demo/legitimate', demoController.runLegitimateDemo);
router.post('/demo/adversarial', demoController.runAdversarialDemo);

module.exports = router;
