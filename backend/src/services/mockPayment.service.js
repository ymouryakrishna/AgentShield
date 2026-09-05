class MockPaymentService {
  static createOrder(params) {
    const { amountInRupees, currency = 'INR', receiptId, notes = {} } = params;
    const orderId = `order_mock_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const amountInPaise = Math.round(amountInRupees * 100);

    return {
      orderId,
      amount: amountInPaise,
      amountInRupees,
      currency,
      receipt: receiptId,
      status: 'created',
      paymentMode: 'MOCK',
      isMock: true,
      notes,
    };
  }

  static verifyPaymentSignature(params) {
    const { orderId, paymentId, signature } = params;
    const isSignatureValid = !!(signature && (
      signature === 'test_verified_signature' ||
      signature.startsWith('simulated_') ||
      signature.startsWith('sandbox_') ||
      signature.length >= 8
    ));

    return {
      verified: isSignatureValid,
      orderId,
      paymentId: paymentId || `pay_mock_${Date.now().toString(36)}`,
      status: isSignatureValid ? 'PAID' : 'VERIFICATION_FAILED',
      paymentMode: 'MOCK',
      paidAt: new Date().toISOString(),
      message: isSignatureValid ? 'Payment verified successfully via Mock Payment Adapter.' : 'Invalid mock signature.',
    };
  }
}

module.exports = MockPaymentService;
