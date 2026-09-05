const express = require('express');
const router = express.Router();
const negotiationController = require('../controllers/negotiationController');

router.post('/negotiations', negotiationController.createNegotiation);
router.post('/negotiations/:id/offers', negotiationController.processOffer);
router.post('/negotiations/:id/offer', negotiationController.processOffer);
router.post('/negotiations/:id/accept', negotiationController.acceptOffer);

module.exports = router;
