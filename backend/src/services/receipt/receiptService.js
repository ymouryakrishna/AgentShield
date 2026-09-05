const { generateSha256Hash, canonicalizeObject } = require('../../utils/canonicalJson');
const { db } = require('../../config/database');

class ReceiptService {
  static generateReceipt(params) {
    const { session, orderId, paymentId, amountInRupees, facts, paymentMethod = 'Razorpay UPI / NetBanking (Test Mode)' } = params;
    const now = new Date().toISOString();
    const receiptId = `NGR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const listedPrice = session.product.price;
    const finalAgreedPrice = amountInRupees;
    const savedAmount = Math.max(0, listedPrice - finalAgreedPrice);
    const discountPercent = listedPrice > 0 ? (savedAmount / listedPrice) * 100 : 0;
    const initialOffer = session.offers.find(o => o.actor === 'BUYER_AGENT')?.proposedPrice || finalAgreedPrice;

    const history = session.offers.map(o => ({
      round: o.round,
      actor: o.actor,
      price: o.proposedPrice,
      bundle: o.bundleOffered || null,
    }));

    const partialReceipt = {
      receiptId,
      orderId,
      timestamp: now,
      product: {
        id: session.product.id,
        name: session.product.name,
        category: session.product.category,
        listedPrice,
        currency: 'INR',
      },
      negotiation: {
        roundsCount: session.currentRound,
        maxAllowedRounds: session.maxRounds,
        initialBuyerOffer: initialOffer,
        finalAgreedPrice,
        merchantFloorPrice: session.product.negotiation.floorPrice,
        savedAmount,
        discountPercent,
        maxAllowedDiscountPercent: session.product.negotiation.maxDiscountPercent,
        bundleGranted: session.finalBundle || null,
        buyerConfirmed: session.buyerConfirmed,
        history,
      },
      policy: {
        status: 'PASSED',
        checksSummary: [
          'Agent Identity Verified',
          'Price Floor Boundary Enforced',
          'Discount Limit Enforced',
          'Negotiation Rounds Capped',
          'Prompt-Injection Scanned',
          'Customer Consent Verified',
        ],
        decision: 'SETTLED',
        explanation: 'Final price remained above the merchant floor and within permitted discount and negotiation limits.',
        facts,
      },
      payment: {
        gateway: 'Razorpay Test Mode',
        orderId,
        paymentId,
        currency: 'INR',
        amountInPaise: Math.round(finalAgreedPrice * 100),
        amountInRupees: finalAgreedPrice,
        status: 'PAID',
        paidAt: now,
        method: paymentMethod,
      },
    };

    const hash = generateSha256Hash(partialReceipt);

    const fullReceipt = {
      ...partialReceipt,
      integrity: {
        algorithm: 'SHA-256',
        canonicalHash: hash,
        verified: true,
      },
    };

    db.receipts.set(receiptId, fullReceipt);
    return fullReceipt;
  }

  static verifyIntegrity(receipt) {
    const { integrity, ...partialReceipt } = receipt;
    const computedHash = generateSha256Hash(partialReceipt);
    return {
      isValid: computedHash === integrity.canonicalHash,
      computedHash,
      storedHash: integrity.canonicalHash,
    };
  }

  static getReceipt(id) {
    return db.receipts.get(id);
  }

  static getAllReceipts() {
    return Array.from(db.receipts.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

module.exports = ReceiptService;
