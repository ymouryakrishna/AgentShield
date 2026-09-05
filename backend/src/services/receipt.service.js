const { generateSha256Hash, canonicalizeObject } = require('../utils/canonicalJson');
const { db } = require('../config/database');
const NegotiationReceipt = require('../models/NegotiationReceipt');

class ReceiptService {
  /**
   * Generates a canonical tamper-evident negotiation receipt.
   */
  static generateReceipt(params) {
    const { session, orderId, paymentId, finalPrice, policyFacts, explanation, paymentMode = 'MOCK' } = params;
    const now = new Date().toISOString();
    const receiptId = `NGR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const product = db.products.get(session.productId) || {
      id: session.productId,
      name: session.productName || 'Running Shoes',
      category: 'sports',
      listPrice: session.listPrice || 2499,
      floorPrice: session.floorPrice || 2200,
      maxDiscountPercent: 12,
    };

    const listPrice = product.listPrice;
    const floorPrice = product.floorPrice;
    const savedAmount = Math.max(0, listPrice - finalPrice);
    const discountPercent = listPrice > 0 ? (savedAmount / listPrice) * 100 : 0;

    const offerHistory = session.offers.map(o => ({
      round: o.round,
      actor: o.actor,
      price: o.proposedPrice,
      bundle: o.bundleOffered || o.bundle || null,
    }));

    const partialReceipt = {
      receiptId,
      timestamp: now,
      agentId: session.agentId,
      sessionId: session.sessionId,
      product: {
        id: product.id,
        name: product.name,
        category: product.category,
      },
      listPrice,
      floorPrice,
      finalPrice,
      discountPercent: Number(discountPercent.toFixed(1)),
      maxDiscountPercent: product.maxDiscountPercent,
      negotiationRounds: session.round,
      offerHistory,
      bundle: session.bundle || null,
      policyDecision: 'SETTLE',
      policyFacts: policyFacts || {},
      explanation: explanation || 'Settlement verified and approved under merchant policy.',
      customerConsent: session.customerConsent,
      paymentMode,
      paymentStatus: 'PAID',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
    };

    const hash = generateSha256Hash(partialReceipt);

    const receipt = new NegotiationReceipt({
      ...partialReceipt,
      receiptHash: hash,
      integrity: {
        algorithm: 'SHA-256',
        canonicalHash: hash,
        verified: true,
      },
    });

    db.receipts.set(receipt.receiptId, receipt);
    return receipt;
  }

  /**
   * Verifies cryptographic integrity of a receipt by recomputing canonical SHA-256 hash.
   */
  static verifyIntegrity(receipt) {
    const { receiptHash, integrity, ...partialReceipt } = receipt;
    const computedHash = generateSha256Hash(partialReceipt);
    const expectedHash = receiptHash || integrity?.canonicalHash;
    const isValid = computedHash === expectedHash;

    return {
      status: isValid ? 'INTEGRITY_VERIFIED' : 'INTEGRITY_FAILED',
      isValid,
      computedHash,
      storedHash: expectedHash,
    };
  }

  static getReceiptById(receiptId) {
    return db.receipts.get(receiptId);
  }

  static getAllReceipts() {
    return Array.from(db.receipts.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

module.exports = ReceiptService;
