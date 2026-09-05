class NegotiationReceipt {
  constructor(data) {
    this.receiptId = data.receiptId || `NGR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    this.timestamp = data.timestamp || new Date().toISOString();
    this.agentId = data.agentId;
    this.sessionId = data.sessionId;
    this.product = data.product;
    this.listPrice = data.listPrice;
    this.floorPrice = data.floorPrice;
    this.finalPrice = data.finalPrice;
    this.discountPercent = data.discountPercent;
    this.maxDiscountPercent = data.maxDiscountPercent;
    this.negotiationRounds = data.negotiationRounds;
    this.offerHistory = data.offerHistory || [];
    this.bundle = data.bundle || null;
    this.policyDecision = data.policyDecision || 'SETTLE';
    this.policyFacts = data.policyFacts || {};
    this.explanation = data.explanation || '';
    this.customerConsent = data.customerConsent !== false;
    this.paymentMode = data.paymentMode || 'MOCK';
    this.paymentStatus = data.paymentStatus || 'PAID';
    this.razorpayOrderId = data.razorpayOrderId || null;
    this.razorpayPaymentId = data.razorpayPaymentId || null;
    this.receiptHash = data.receiptHash || null;
    this.integrity = data.integrity || {
      algorithm: 'SHA-256',
      canonicalHash: data.receiptHash,
      verified: true,
    };
  }
}

module.exports = NegotiationReceipt;
