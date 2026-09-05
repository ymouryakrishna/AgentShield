const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/payments/create', paymentController.createPaymentOrder);
router.post('/payments/verify', paymentController.verifyPayment);
router.post('/webhooks/razorpay', paymentController.webhook);

module.exports = router;
