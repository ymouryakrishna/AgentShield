const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/payments/create', paymentController.createPaymentOrder);
router.post('/payments/create-order', paymentController.createPaymentOrder);
router.post('/payments/verify', paymentController.verifyPayment);

module.exports = router;
