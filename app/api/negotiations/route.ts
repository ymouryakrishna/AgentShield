import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/lib/catalog';
import { BoundedNegotiationEngine } from '@/lib/negotiation';
import { StoreService } from '@/lib/store';
import { AuditLogService } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId = 'shoe-001', buyerAgentId = 'agent-a-legitimate', buyerAgentName } = body;

    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, code: 'PRODUCT_NOT_FOUND', message: `Product ${productId} does not exist.` },
        { status: 404 }
      );
    }

    const session = BoundedNegotiationEngine.createSession(product, buyerAgentId, buyerAgentName);
    StoreService.saveSession(session);

    AuditLogService.log({
      actor: buyerAgentId === 'agent-b-adversarial' ? 'AGENT_B_ADVERSARIAL' : 'AGENT_A_LEGITIMATE',
      action: 'NEGOTIATION_STARTED',
      result: 'SUCCESS',
      reason: `Negotiation session ${session.id} initiated for ${product.name} (Listed: ₹${product.price}).`,
      relatedSessionId: session.id,
      metadata: { productId, listedPrice: product.price, floorPrice: product.negotiation.floorPrice },
    });

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, code: 'NEGOTIATION_INIT_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
