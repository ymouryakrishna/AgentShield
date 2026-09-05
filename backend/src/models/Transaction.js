class Transaction {
  constructor(data) {
    this.id = data.id || `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    this.sessionId = data.sessionId;
    this.agentId = data.agentId;
    this.productId = data.productId;
    this.productName = data.productName;
    this.isNegotiated = data.isNegotiated !== false;
    this.listPrice = data.listPrice || data.basePrice;
    this.finalPrice = data.finalPrice;
    this.bundleAttached = data.bundleAttached || null;
    this.paymentMode = data.paymentMode || 'MOCK';
    this.paymentStatus = data.paymentStatus || 'PAID';
    this.razorpayOrderId = data.razorpayOrderId || data.orderId;
    this.razorpayPaymentId = data.razorpayPaymentId || data.paymentId;
    this.receiptId = data.receiptId;
    this.timestamp = data.timestamp || new Date().toISOString();
  }
}

module.exports = Transaction;
