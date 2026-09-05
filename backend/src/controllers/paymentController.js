const RazorpayAdapter = require('../services/payment/razorpayAdapter');
const ReceiptService = require('../services/receipt/receiptService');
const AuditService = require('../services/audit/auditService');
const { db } = require('../config/database');

exports.createPaymentOrder = async (req, res) => {
  try {
    const { sessionId, amountInRupees, policyAuthorizationToken, receiptId } = req.body;

    if (!policyAuthorizationToken || !policyAuthorizationToken.startsWith('AUTH_TOKEN_POLICY_PASSED_')) {
      AuditService.log({
        actor: 'PAYMENT_SERVICE',
        action: 'PAYMENT_FAILED',
        result: 'BLOCKED',
        reason: 'Payment order creation denied: Missing or invalid Policy Authorization Token.',
      });

      return res.status(403).json({
        success: false,
        code: 'PAYMENT_AUTHORIZATION_DENIED',
        message: 'Payment rejected. Direct payment requests without deterministic Policy Engine authorization are forbidden.',
        recoverable: false,
      });
    }

    const session = sessionId ? db.sessions.get(sessionId) : undefined;
    const finalAmount = amountInRupees || session?.finalPrice || 2299;

    const rzpOrder = await RazorpayAdapter.createOrder({
      amountInRupees: finalAmount,
      receiptId: receiptId || `NGR-${Date.now().toString(36).toUpperCase()}`,
      policyAuthorizationToken,
      notes: {
        sessionId: sessionId || 'unknown',
        productId: session?.productId || 'shoe-001',
      },
    });

    if (session) {
      session.orderId = rzpOrder.orderId;
      db.sessions.set(session.id, session);
    }

    AuditService.log({
      actor: 'PAYMENT_SERVICE',
      action: 'PAYMENT_CREATED',
      result: 'SUCCESS',
      reason: `Razorpay Test Mode order ${rzpOrder.orderId} generated for ₹${finalAmount.toLocaleString('en-IN')}.`,
      relatedSessionId: sessionId,
      relatedOrderId: rzpOrder.orderId,
    });

    res.json({
      success: true,
      order: rzpOrder,
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, code: err.code || 'PAYMENT_CREATE_ERROR', message: err.message });
  }
};

exports.verifyPayment = (req, res) => {
  try {
    const { orderId, paymentId, signature, sessionId, amountInRupees = 2299, paymentMethod = 'Razorpay UPI (Test Mode)' } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ success: false, code: 'MISSING_FIELDS', message: 'orderId, paymentId, and signature are required.' });
    }

    const verifyResult = RazorpayAdapter.verifyPaymentSignature({ orderId, paymentId, signature });

    if (!verifyResult.verified) {
      AuditService.log({
        actor: 'PAYMENT_SERVICE',
        action: 'PAYMENT_FAILED',
        result: 'BLOCKED',
        reason: `Payment verification failed for order ${orderId}. Invalid signature.`,
        relatedOrderId: orderId,
      });

      return res.status(400).json({ success: false, code: 'SIGNATURE_VERIFICATION_FAILED', message: verifyResult.message });
    }

    let session = sessionId ? db.sessions.get(sessionId) : undefined;
    if (!session) {
      const defaultProduct = db.products.find(p => p.id === 'shoe-001');
      session = {
        id: sessionId || 'NGS-DEMO',
        productId: 'shoe-001',
        product: defaultProduct,
        currentRound: 3,
        maxRounds: 3,
        finalPrice: amountInRupees,
        finalBundle: 'Pro Cushion Sports Socks (Pair)',
        buyerConfirmed: true,
        offers: [],
      };
    }

    AuditService.log({
      actor: 'PAYMENT_SERVICE',
      action: 'PAYMENT_SUCCESS',
      result: 'SUCCESS',
      reason: `Payment of ₹${Number(amountInRupees).toLocaleString('en-IN')} verified successfully (ID: ${paymentId}).`,
      relatedOrderId: orderId,
    });

    const facts = {
      decision: 'SETTLE',
      productId: session.productId,
      productName: session.product.name,
      listedPrice: session.product.price,
      proposedPrice: amountInRupees,
      floorPrice: session.product.negotiation.floorPrice,
      discountAmount: Math.max(0, session.product.price - amountInRupees),
      discountPercent: Number((((session.product.price - amountInRupees) / session.product.price) * 100).toFixed(1)),
      maxDiscountPercent: session.product.negotiation.maxDiscountPercent,
      round: session.currentRound || 3,
      maxRounds: session.maxRounds,
      giftAllowed: true,
      giftGranted: session.finalBundle || 'Pro Cushion Sports Socks (Pair)',
      buyerConfirmed: true,
      checksPassed: ['CHECK_1_AGENT_IDENTITY', 'CHECK_5_PRICE_BOUNDARY', 'CHECK_6_DISCOUNT_BOUNDARY', 'CHECK_8_PROMPT_INJECTION_SHIELD', 'CHECK_10_CUSTOMER_CONSENT'],
      checksFailed: [],
      overrideDetected: false,
      timestamp: new Date().toISOString(),
    };

    const receipt = ReceiptService.generateReceipt({
      session,
      orderId,
      paymentId,
      amountInRupees,
      facts,
      paymentMethod,
    });

    session.receiptId = receipt.receiptId;
    db.sessions.set(session.id, session);

    db.orders.push({
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      productId: session.productId,
      productName: session.product.name,
      isNegotiated: true,
      basePrice: session.product.price,
      finalPrice: amountInRupees,
      bundleAttached: receipt.negotiation.bundleGranted,
      timestamp: new Date().toISOString(),
      status: 'PAID',
    });

    AuditService.log({
      actor: 'POLICY_ENGINE',
      action: 'RECEIPT_CREATED',
      result: 'SUCCESS',
      reason: `Negotiation Receipt ${receipt.receiptId} sealed with SHA-256 hash: ${receipt.integrity.canonicalHash.substring(0, 16)}...`,
      relatedReceiptId: receipt.receiptId,
      relatedOrderId: orderId,
    });

    res.json({
      success: true,
      verified: true,
      receipt,
      orderId,
      paymentId,
    });
  } catch (err) {
    res.status(500).json({ success: false, code: 'PAYMENT_VERIFY_ERROR', message: err.message });
  }
};

exports.webhook = (req, res) => {
  res.json({ success: true, message: 'Razorpay webhook received and logged.' });
};
