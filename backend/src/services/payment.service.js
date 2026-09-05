const AuthorizationService = require('./authorization.service');
const RazorpayService = require('./razorpay.service');
const MockPaymentService = require('./mockPayment.service');
const { db } = require('../config/database');
const { AuthorizationError, AppError } = require('../utils/errors');
const env = require('../config/env');

class PaymentService {
  /**
   * Safe server-side order creation gated strictly by policy authorization token.
   */
  static async createOrder(params) {
    const { sessionId, amountInRupees, currency = 'INR', policyAuthorizationToken, receiptId, notes = {} } = params;

    // 1. Mandatory Policy Authorization Check
    const authResult = AuthorizationService.validateToken(policyAuthorizationToken, amountInRupees, sessionId);

    // 2. Validate session & product floor
    let productFloor = 0;
    if (sessionId) {
      const session = db.sessions.get(sessionId);
      if (session) {
        productFloor = session.floorPrice || 0;
      }
    }

    if (amountInRupees < productFloor) {
      throw new AuthorizationError(
        `Payment rejected: Requested amount ₹${amountInRupees} is below product floor of ₹${productFloor}.`,
        'PRICE_BELOW_FLOOR'
      );
    }

    // 3. Delegate to Razorpay or Mock Adapter
    let orderResult;
    if (env.PAYMENT_MODE === 'razorpay' && RazorpayService.isConfigured()) {
      orderResult = await RazorpayService.createOrder({
        amountInRupees,
        currency,
        receiptId: receiptId || `NGR-${Date.now().toString(36)}`,
        notes: {
          ...notes,
          sessionId: sessionId || 'unknown',
          authPolicy: authResult.policyVersion,
        },
      });
    } else {
      orderResult = MockPaymentService.createOrder({
        amountInRupees,
        currency,
        receiptId: receiptId || `NGR-${Date.now().toString(36)}`,
        notes,
      });
    }

    return orderResult;
  }

  /**
   * Verifies payment completion signature.
   */
  static verifyPayment(params) {
    const { orderId, paymentId, signature } = params;

    if (!orderId || !paymentId || !signature) {
      throw new AppError('MISSING_PAYMENT_FIELDS', 'orderId, paymentId, and signature are required.', 400);
    }

    if (env.PAYMENT_MODE === 'razorpay' && RazorpayService.isConfigured()) {
      return RazorpayService.verifyPaymentSignature(params);
    }

    return MockPaymentService.verifyPaymentSignature(params);
  }
}

module.exports = PaymentService;
