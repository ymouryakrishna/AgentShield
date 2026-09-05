import { NextRequest, NextResponse } from 'next/server';
import { StoreService } from '@/lib/store';
import { AuditLogService } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await req.json();
    const { finalPrice, customerConsent = true } = body;

    const session = StoreService.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, code: 'SESSION_NOT_FOUND', message: `Session ${sessionId} not found.` },
        { status: 404 }
      );
    }

    if (!customerConsent) {
      return NextResponse.json(
        { success: false, code: 'CONSENT_REQUIRED', message: 'Explicit customer consent is required to authorize payment.' },
        { status: 400 }
      );
    }

    // Determine final settled price from last offers or param
    const agreedPrice = finalPrice || session.finalPrice || session.offers[session.offers.length - 1]?.proposedPrice || session.product.price;

    // Strict safety check: Ensure agreed price is >= floor
    if (agreedPrice < session.product.negotiation.floorPrice) {
      return NextResponse.json(
        { success: false, code: 'PRICE_BELOW_FLOOR', message: `Cannot accept price ₹${agreedPrice} below merchant floor of ₹${session.product.negotiation.floorPrice}.` },
        { status: 400 }
      );
    }

    session.status = 'SETTLED';
    session.finalPrice = agreedPrice;
    session.finalDiscountPercent = ((session.product.price - agreedPrice) / session.product.price) * 100;
    session.buyerConfirmed = true;
    session.updatedAt = new Date().toISOString();

    StoreService.saveSession(session);

    // Audit logs
    AuditLogService.log({
      actor: 'CUSTOMER',
      action: 'BUYER_CONFIRMED',
      result: 'SUCCESS',
      reason: `Customer confirmed final agreed price of ₹${agreedPrice.toLocaleString('en-IN')}.`,
      relatedSessionId: session.id,
      metadata: { agreedPrice, bundle: session.finalBundle },
    });

    const policyAuthorizationToken = `AUTH_TOKEN_POLICY_PASSED_${session.id}_${Date.now()}`;

    AuditLogService.log({
      actor: 'FIREWALL',
      action: 'POLICY_APPROVED',
      result: 'SUCCESS',
      reason: `Deterministic policy checks approved. Policy token issued: ${policyAuthorizationToken}`,
      relatedSessionId: session.id,
      metadata: { policyAuthorizationToken, finalPrice: agreedPrice },
    });

    return NextResponse.json({
      success: true,
      session,
      policyAuthorizationToken,
      message: 'Settlement confirmed. Ready for Razorpay Test Mode checkout.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, code: 'ACCEPT_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
