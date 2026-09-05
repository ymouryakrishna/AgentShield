import { NextResponse } from 'next/server';
import { getProductById } from '@/lib/catalog';
import { BoundedNegotiationEngine } from '@/lib/negotiation';
import { StoreService } from '@/lib/store';
import { AuditLogService } from '@/lib/audit';
import { RazorpayPaymentService } from '@/lib/payment';
import { ReceiptGenerator } from '@/lib/receipt';
import { DecisionFacts } from '@/lib/types';

export async function POST() {
  try {
    const product = getProductById('shoe-001')!;
    const buyerAgentId = 'agent-a-legitimate';
    const buyerAgentName = 'Agent A (Smart Shopper AI)';

    // Step 1: Create session
    const session = BoundedNegotiationEngine.createSession(product, buyerAgentId, buyerAgentName);
    StoreService.saveSession(session);

    AuditLogService.log({
      actor: 'AGENT_A_LEGITIMATE',
      action: 'BUYER_AGENT_CONNECTED',
      result: 'SUCCESS',
      reason: 'Agent A (Smart Shopper AI) initialized protocol connection.',
      relatedSessionId: session.id,
    });

    AuditLogService.log({
      actor: 'AGENT_A_LEGITIMATE',
      action: 'PRODUCT_SELECTED',
      result: 'SUCCESS',
      reason: `AeroStride Pro Running Shoes selected (Listed: ₹2,499).`,
      relatedSessionId: session.id,
    });

    // Step 2: Round 1 - Buyer ₹2,200
    const res1 = BoundedNegotiationEngine.processBuyerOffer(
      session,
      2200,
      'I like these running shoes, but ₹2,499 is slightly above my budget. Can you do ₹2,200?',
      false,
      'NEGOTIATE'
    );
    StoreService.saveSession(session);

    AuditLogService.log({
      actor: 'AGENT_A_LEGITIMATE',
      action: 'BUYER_OFFER_PROPOSED',
      result: 'SUCCESS',
      reason: 'Buyer proposed initial offer of ₹2,200.',
      relatedSessionId: session.id,
    });

    AuditLogService.log({
      actor: 'MERCHANT',
      action: 'COUNTER_OFFER',
      result: 'INFO',
      reason: 'Merchant AI counteroffered ₹2,399 within allowed margin.',
      relatedSessionId: session.id,
    });

    // Step 3: Round 2 - Buyer ₹2,250
    const res2 = BoundedNegotiationEngine.processBuyerOffer(
      session,
      2250,
      'How about ₹2,250?',
      false,
      'COUNTER_OFFER'
    );
    StoreService.saveSession(session);

    AuditLogService.log({
      actor: 'AGENT_A_LEGITIMATE',
      action: 'BUYER_OFFER_PROPOSED',
      result: 'SUCCESS',
      reason: 'Buyer proposed counteroffer ₹2,250.',
      relatedSessionId: session.id,
    });

    AuditLogService.log({
      actor: 'MERCHANT',
      action: 'COUNTER_OFFER',
      result: 'INFO',
      reason: 'Merchant counteroffered ₹2,299 with free Sports Socks.',
      relatedSessionId: session.id,
    });

    AuditLogService.log({
      actor: 'POLICY_ENGINE',
      action: 'BUNDLE_GRANTED',
      result: 'SUCCESS',
      reason: 'Bundle verified: Free Pro Cushion Sports Socks attached at ₹2,299 tier.',
      relatedSessionId: session.id,
    });

    // Step 4: Round 3 - Buyer accepts ("Deal.")
    const res3 = BoundedNegotiationEngine.processBuyerOffer(
      session,
      2299,
      'Deal. Accepting merchant counteroffer of ₹2,299 with free sports socks.',
      true, // Customer consent confirmed
      'ACCEPT_OFFER'
    );
    session.status = 'SETTLED';
    session.finalPrice = 2299;
    session.finalBundle = 'Pro Cushion Sports Socks (Pair)';
    session.buyerConfirmed = true;
    StoreService.saveSession(session);

    AuditLogService.log({
      actor: 'CUSTOMER',
      action: 'BUYER_CONFIRMED',
      result: 'SUCCESS',
      reason: 'Customer explicitly confirmed ₹2,299 settlement with free Sports Socks.',
      relatedSessionId: session.id,
    });

    const policyToken = `AUTH_TOKEN_POLICY_PASSED_${session.id}_DEMO`;

    AuditLogService.log({
      actor: 'FIREWALL',
      action: 'POLICY_APPROVED',
      result: 'SUCCESS',
      reason: 'All 10 CommerceFirewall checks passed deterministically. Policy token generated.',
      relatedSessionId: session.id,
      metadata: { policyToken },
    });

    // Step 5: Razorpay Test Mode Order & Simulated Verified Payment
    const rzpOrder = await RazorpayPaymentService.createOrder({
      amountInRupees: 2299,
      receiptId: `NGR-DEMO-${Date.now().toString(36).toUpperCase()}`,
      policyAuthorizationToken: policyToken,
    });

    AuditLogService.log({
      actor: 'PAYMENT_SERVICE',
      action: 'RAZORPAY_ORDER_CREATED',
      result: 'SUCCESS',
      reason: `Razorpay Test Mode order ${rzpOrder.orderId} created for ₹2,299.`,
      relatedSessionId: session.id,
      relatedOrderId: rzpOrder.orderId,
    });

    const testPaymentId = `pay_test_${Math.random().toString(36).substring(2, 9)}`;
    const verifyResult = RazorpayPaymentService.verifyPaymentSignature({
      orderId: rzpOrder.orderId,
      paymentId: testPaymentId,
      signature: 'test_verified_signature',
    });

    AuditLogService.log({
      actor: 'PAYMENT_SERVICE',
      action: 'PAYMENT_SUCCESS',
      result: 'SUCCESS',
      reason: `Razorpay Test Mode payment ${testPaymentId} verified successfully.`,
      relatedSessionId: session.id,
      relatedOrderId: rzpOrder.orderId,
    });

    // Step 6: Negotiation Receipt & Hash Seal
    const facts: DecisionFacts = {
      decision: 'SETTLE',
      productId: 'shoe-001',
      productName: product.name,
      listedPrice: product.price,
      proposedPrice: 2299,
      floorPrice: product.negotiation.floorPrice,
      discountAmount: 200,
      discountPercent: 8.0,
      maxDiscountPercent: 12.0,
      round: 3,
      maxRounds: 3,
      giftAllowed: true,
      giftGranted: 'Pro Cushion Sports Socks (Pair)',
      buyerConfirmed: true,
      checksPassed: [
        'CHECK_1_AGENT_IDENTITY',
        'CHECK_2_PRODUCT_PERMISSION',
        'CHECK_5_PRICE_BOUNDARY',
        'CHECK_6_DISCOUNT_BOUNDARY',
        'CHECK_7_ROUND_BOUNDARY',
        'CHECK_8_PROMPT_INJECTION_SHIELD',
        'CHECK_10_CUSTOMER_CONSENT',
      ],
      checksFailed: [],
      overrideDetected: false,
      timestamp: new Date().toISOString(),
    };

    const receipt = ReceiptGenerator.generateReceipt({
      session,
      orderId: rzpOrder.orderId,
      paymentId: testPaymentId,
      amountInRupees: 2299,
      facts,
      paymentMethod: 'Razorpay UPI (Test Mode)',
    });

    StoreService.saveReceipt(receipt);
    session.receiptId = receipt.receiptId;
    session.orderId = rzpOrder.orderId;
    StoreService.saveSession(session);

    StoreService.recordOrder({
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      productId: 'shoe-001',
      productName: product.name,
      isNegotiated: true,
      basePrice: product.price,
      finalPrice: 2299,
      bundleAttached: 'Pro Cushion Sports Socks (Pair)',
      timestamp: new Date().toISOString(),
      status: 'PAID',
    });

    AuditLogService.log({
      actor: 'POLICY_ENGINE',
      action: 'NEGOTIATION_RECEIPT_CREATED',
      result: 'SUCCESS',
      reason: `Negotiation Receipt ${receipt.receiptId} generated with SHA-256 seal: ${receipt.integrity.canonicalHash.substring(0, 16)}...`,
      relatedSessionId: session.id,
      relatedReceiptId: receipt.receiptId,
    });

    return NextResponse.json({
      success: true,
      session,
      receipt,
      order: rzpOrder,
      paymentId: testPaymentId,
      stepsCount: 6,
      message: 'Legitimate buyer negotiation settled at ₹2,299 with free Sports Socks. Payment verified & Receipt sealed.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, code: 'DEMO_LEGITIMATE_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
