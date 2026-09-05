const ReceiptService = require('../services/receipt/receiptService');

exports.getReceiptById = (req, res) => {
  try {
    const receipt = ReceiptService.getReceipt(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, code: 'RECEIPT_NOT_FOUND', message: `Receipt ${req.params.id} not found.` });
    }

    const integrityCheck = ReceiptService.verifyIntegrity(receipt);

    res.json({
      success: true,
      receipt,
      integrityCheck,
    });
  } catch (err) {
    res.status(500).json({ success: false, code: 'RECEIPT_FETCH_ERROR', message: err.message });
  }
};

exports.getAllReceipts = (req, res) => {
  try {
    const receipts = ReceiptService.getAllReceipts();
    res.json({
      success: true,
      count: receipts.length,
      receipts,
    });
  } catch (err) {
    res.status(500).json({ success: false, code: 'RECEIPTS_FETCH_ERROR', message: err.message });
  }
};
