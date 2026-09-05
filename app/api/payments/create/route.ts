import { NextRequest, NextResponse } from 'next/server';
import { RazorpayPaymentService } from '@/lib/payment';
import { StoreService } from '@/lib/store';
import { AuditLogService } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, amountInRupees, policyAuthorizationToken, receiptId } = body;

    // Strict Gate: AI can never directly create payment order without policy authorization token
    if (!policyAuthorizationToken || !policyAuthorizationToken.startsWith('AUTH_TOKEN_POLICY_PASSED_')) {
      AuditLogService.log({
        actor: 'PAYMENT_SERVICE',
        action: 'REQUEST_BLOCKED',
        result: 'BLOCKED',
        reason: 'Payment order creation rejected: Missing or invalid Policy Authorization Token.',
        metadata: { attemptedSessionId: sessionId },
      });

      return NextResponse.json(
        { 
          success: false, 
          code: 'PAYMENT_AUTHORIZATION_DENIED', 
          message: 'Payment rejected. Direct payment requests without deterministic Policy Engine authorization are forbidden.',
          recoverable: false,
        },
        { status: 403 }
      );
    }

    const session = sessionId ? StoreService.getSession(sessionId) : undefined;
    const finalAmount = amountInRupees || session?.finalPrice || 2299;

    const rzpOrder = await RazorpayPaymentService.createOrder({
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
      StoreService.saveSession(session);
    }

    AuditLogService.log({
      actor: 'PAYMENT_SERVICE',
      action: 'RAZORPAY_ORDER_CREATED',
      result: 'SUCCESS',
      reason: `Razorpay Test Mode order ${rzpOrder.orderId} generated for ₹${finalAmount.toLocaleString('en-IN')}.`,
      relatedSessionId: sessionId,
      relatedOrderId: rzpOrder.orderId,
      metadata: {
        amountInPaise: rzpOrder.amount,
        currency: rzpOrder.currency,
        isMock: rzpOrder.isMock,
      },
    });

    return NextResponse.json({
      success: true,
      order: rzpOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, code: 'PAYMENT_CREATE_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
