const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receipt.controller');

router.get('/receipts', receiptController.getAllReceipts);
router.get('/receipts/:id', receiptController.getReceiptById);
router.post('/receipts/:id/verify', receiptController.verifyReceipt);

module.exports = router;
