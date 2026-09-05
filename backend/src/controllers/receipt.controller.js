const ReceiptService = require('../services/receipt.service');
const { NotFoundError } = require('../utils/errors');

exports.getAllReceipts = (req, res, next) => {
  try {
    const receipts = ReceiptService.getAllReceipts();
    res.json({
      success: true,
      count: receipts.length,
      receipts,
    });
  } catch (err) {
    next(err);
  }
};

exports.getReceiptById = (req, res, next) => {
  try {
    const receipt = ReceiptService.getReceiptById(req.params.id);
    if (!receipt) {
      throw new NotFoundError(`Receipt '${req.params.id}' not found.`);
    }

    const integrityCheck = ReceiptService.verifyIntegrity(receipt);

    res.json({
      success: true,
      receipt,
      receiptHash: receipt.receiptHash || receipt.integrity?.canonicalHash,
      integrityCheck,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyReceipt = (req, res, next) => {
  try {
    const receiptId = req.params.id;
    let receiptToVerify = req.body?.receipt;

    if (!receiptToVerify) {
      receiptToVerify = ReceiptService.getReceiptById(receiptId);
    }

    if (!receiptToVerify) {
      throw new NotFoundError(`Receipt '${receiptId}' not found for verification.`);
    }

    const result = ReceiptService.verifyIntegrity(receiptToVerify);

    res.json({
      success: true,
      status: result.status, // INTEGRITY_VERIFIED | INTEGRITY_FAILED
      isValid: result.isValid,
      computedHash: result.computedHash,
      storedHash: result.storedHash,
    });
  } catch (err) {
    next(err);
  }
};
