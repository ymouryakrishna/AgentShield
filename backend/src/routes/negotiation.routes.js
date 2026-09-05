const express = require('express');
const router = express.Router();
const negotiationController = require('../controllers/negotiation.controller');

router.post('/negotiations/start', negotiationController.startNegotiation);
router.post('/negotiations', negotiationController.createNegotiation);
router.get('/negotiations/:id', negotiationController.getSession);
router.post('/negotiations/:id/offer', negotiationController.processOffer);
router.post('/negotiations/:id/offers', negotiationController.processOffer);
router.post('/negotiations/:id/accept', negotiationController.acceptOffer);

module.exports = router;
