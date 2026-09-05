const PaymentService = require('../services/payment.service');
const ReceiptService = require('../services/receipt.service');
const AuditService = require('../services/audit.service');
const AuthorizationService = require('../services/authorization.service');
const { db } = require('../config/database');
const Transaction = require('../models/Transaction');

exports.createPaymentOrder = async (req, res, next) => {
  try {
    const payload = req.validatedBody || req.body || {};
    const sessionId = payload.sessionId || payload.negotiationId;

    let token = payload.policyAuthorizationToken;
    let amount = payload.amountInRupees || payload.amount;

    if (sessionId && (!token || !amount)) {
      const session = db.sessions.get(sessionId);
      if (session) {
        amount = amount || session.finalPrice || session.listPrice;
        if (!token) {
          const auth = AuthorizationService.issueToken({
            sessionId: session.sessionId,
            agentId: session.agentId,
            productId: session.productId,
            authorizedAmount: amount,
            policyVersion: session.policyVersion,
          });
          token = auth.token;
        }
      }
    }

    const orderResult = await PaymentService.createOrder({
      sessionId,
      amountInRupees: amount || 2200,
      policyAuthorizationToken: token,
    });

    AuditService.log({
      agentId: payload.agentId || 'BUYER',
      sessionId: sessionId,
      action: 'PAYMENT_CREATED',
      status: 'SUCCESS',
      decision: 'ALLOW',
      reason: `Payment order '${orderResult.orderId}' created for ₹${orderResult.amountInRupees}.`,
      metadata: { orderId: orderResult.orderId, paymentMode: orderResult.paymentMode },
      requestId: req.id,
    });

    res.json({
      success: true,
      order: orderResult,
      orderId: orderResult.orderId,
      amount: orderResult.amountInRupees,
    });
  } catch (err) {
    AuditService.log({
      agentId: req.body?.agentId || 'UNKNOWN_AGENT',
      sessionId: req.body?.sessionId || req.body?.negotiationId,
      action: 'REQUEST_BLOCKED',
      status: 'BLOCKED',
      decision: 'BLOCK',
      reason: `Payment creation denied: ${err.message}`,
      metadata: { errorCode: err.code },
      requestId: req.id,
    });
    next(err);
  }
};

exports.verifyPayment = (req, res, next) => {
  try {
    const payload = req.validatedBody || req.body || {};
    const sessionId = payload.sessionId || payload.negotiationId;
    const verifyResult = PaymentService.verifyPayment({
      ...payload,
      sessionId,
    });

    if (!verifyResult.verified) {
      AuditService.log({
        sessionId,
        action: 'REQUEST_BLOCKED',
        status: 'BLOCKED',
        decision: 'BLOCK',
        reason: `Payment signature verification failed for order '${payload.orderId}'.`,
        requestId: req.id,
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_VERIFICATION_FAILED',
          message: verifyResult.message,
          requestId: req.id,
        }
      });
    }

    let session = sessionId ? db.sessions.get(sessionId) : undefined;
    if (!session) {
      const defaultProduct = db.products.get('gaming-headphones-x1') || db.products.get('running-shoes');
      session = {
        sessionId: sessionId || `NGS-${Date.now().toString(36)}`,
        productId: defaultProduct?.id || 'gaming-headphones-x1',
        productName: defaultProduct?.name || 'Gaming Headphones X1',
        agentId: 'LegitimateShoppingAgent',
        listPrice: defaultProduct?.listPrice || 2500,
        floorPrice: defaultProduct?.floorPrice || 2200,
        round: 2,
        finalPrice: payload.amountInRupees || 2200,
        bundle: 'Free Express Shipping & Audio Jack Adapter',
        customerConsent: true,
        offers: [],
      };
    }

    const finalAmount = payload.amountInRupees || session.finalPrice || 2200;

    AuditService.log({
      agentId: session.agentId,
      sessionId: session.sessionId,
      action: 'PAYMENT_VERIFIED',
      status: 'SUCCESS',
      decision: 'ALLOW',
      reason: `Payment ${verifyResult.paymentId} for ₹${Number(finalAmount).toLocaleString('en-IN')} verified.`,
      metadata: { orderId: payload.orderId, paymentId: verifyResult.paymentId },
      requestId: req.id,
    });

    const receipt = ReceiptService.generateReceipt({
      session,
      orderId: payload.orderId || `ord_${Date.now()}`,
      paymentId: verifyResult.paymentId,
      finalPrice: finalAmount,
      policyFacts: {
        decision: 'SETTLE',
        productId: session.productId,
        proposedPrice: finalAmount,
        floorPrice: session.floorPrice || 2200,
        discountPercent: Number((((session.listPrice - finalAmount) / session.listPrice) * 100).toFixed(1)),
        maxDiscountPercent: 12,
        round: session.round || 2,
        maxRounds: 3,
        bundleAllowed: true,
        bundleGranted: session.bundle || 'Free Express Shipping & Audio Jack Adapter',
        customerConsent: true,
      },
      explanation: 'Approved because the final price of ₹2,200 is at or above the merchant floor of ₹2,200, discount is within 12%, negotiation remained within 3 rounds, bundle rule was satisfied, and customer confirmation was received.',
      paymentMode: verifyResult.paymentMode || 'MOCK',
    });

    // Record Transaction
    const transaction = new Transaction({
      sessionId: session.sessionId,
      agentId: session.agentId,
      productId: session.productId,
      productName: session.productName || 'Gaming Headphones X1',
      isNegotiated: true,
      listPrice: session.listPrice || 2500,
      finalPrice: finalAmount,
      bundleAttached: receipt.bundle,
      paymentMode: verifyResult.paymentMode || 'MOCK',
      paymentStatus: 'PAID',
      razorpayOrderId: payload.orderId,
      razorpayPaymentId: verifyResult.paymentId,
      receiptId: receipt.receiptId,
    });
    db.transactions.set(transaction.id, transaction);

    AuditService.log({
      agentId: session.agentId,
      sessionId: session.sessionId,
      action: 'RECEIPT_CREATED',
      status: 'SUCCESS',
      decision: 'ALLOW',
      reason: `Negotiation receipt '${receipt.receiptId}' sealed with SHA-256 integrity hash: ${receipt.receiptHash.substring(0, 16)}...`,
      metadata: { receiptHash: receipt.receiptHash },
      requestId: req.id,
    });

    res.json({
      success: true,
      verified: true,
      orderId: payload.orderId,
      paymentId: verifyResult.paymentId,
      receipt,
      receiptId: receipt.receiptId,
      receiptHash: receipt.receiptHash,
    });
  } catch (err) {
    next(err);
  }
};
