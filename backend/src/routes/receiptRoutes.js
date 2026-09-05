const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');

router.get('/receipts', receiptController.getAllReceipts);
router.get('/receipts/:id', receiptController.getReceiptById);

module.exports = router;
